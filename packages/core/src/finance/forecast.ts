import { addMonths } from "../dates.ts";
import { sum } from "../money.ts";

export type MonthlyValue = { month: string; value: number };

export type ForecastPoint = {
  month: string;
  forecast: number;
  /** 80% interval around the forecast. */
  low: number;
  high: number;
};

export type Backtest = {
  /** Months held out of the fit. */
  months: number;
  mae: number;
  mape: number | null;
  /** 100 − MAPE, a rough "how close was the guess" figure. */
  accuracy: number | null;
};

export type ExpenseForecast = {
  points: ForecastPoint[];
  /** Sum of the forecast points. */
  total: number;
  method: "trend+seasonality" | "trend" | "average";
  /** 0–100; how much to trust the band, from history length and backtest error. */
  confidence: number;
  trendPerMonth: number;
  backtest: Backtest | null;
  assumptions: string[];
};

type Fit = {
  slope: number;
  intercept: number;
  residualStd: number;
  seasonal: Map<number, number>;
  seasonality: boolean;
};

const Z_80 = 1.2816;
const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function monthOf(month: string): number {
  const parsed = Number(month.slice(5, 7));
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 12 ? parsed : 1;
}

/** Ordinary least squares on t = 0..n-1, plus a shrunk month-of-year index. */
function fit(values: number[], months: string[], seasonality: boolean): Fit {
  const n = values.length;
  const meanT = (n - 1) / 2;
  const meanY = sum(values) / n;
  let sxx = 0;
  let sxy = 0;
  for (let t = 0; t < n; t++) {
    sxx += (t - meanT) ** 2;
    sxy += (t - meanT) * ((values[t] ?? 0) - meanY);
  }
  const slope = sxx > 0 ? sxy / sxx : 0;
  const intercept = meanY - slope * meanT;
  let squared = 0;
  for (let t = 0; t < n; t++) squared += ((values[t] ?? 0) - (intercept + slope * t)) ** 2;
  const residualStd = Math.sqrt(squared / Math.max(1, n - 2));

  const byMonth = new Map<number, { ratio: number; count: number }>();
  if (seasonality) {
    for (let t = 0; t < n; t++) {
      const fitted = intercept + slope * t;
      if (fitted <= 0) continue;
      const month = monthOf(months[t] ?? "2000-01");
      const entry = byMonth.get(month) ?? { ratio: 0, count: 0 };
      entry.ratio += (values[t] ?? 0) / fitted;
      entry.count++;
      byMonth.set(month, entry);
    }
  }
  // Shrink each month's index toward 1 so one unusual month can't swing the forecast.
  const seasonal = new Map<number, number>();
  for (const [month, entry] of byMonth) {
    seasonal.set(month, (entry.ratio + 2) / (entry.count + 2));
  }
  return { slope, intercept, residualStd, seasonal, seasonality };
}

function predictAt(fit: Fit, month: string, t: number, n: number) {
  const trend = fit.intercept + fit.slope * t;
  const index = fit.seasonality ? (fit.seasonal.get(monthOf(month)) ?? 1) : 1;
  const value = Math.max(0, trend * index);
  const meanT = (n - 1) / 2;
  let sxx = 0;
  for (let k = 0; k < n; k++) sxx += (k - meanT) ** 2;
  const leverage = sxx > 0 ? (t - meanT) ** 2 / sxx : 0;
  const margin = Z_80 * fit.residualStd * Math.sqrt(1 + 1 / n + leverage) * (fit.seasonality ? 1.15 : 1);
  return { value, margin };
}

/**
 * Fits a straight-line trend plus a month-of-year index to monthly totals and
 * projects the next months with an 80% band. With fewer than four points it
 * falls back to the average; the result says which method it used.
 */
export function forecastExpenses(input: { history: MonthlyValue[]; horizon: number }): ExpenseForecast {
  const history = input.history.filter((point) => Number.isFinite(point.value) && point.value >= 0).slice(-36);
  const horizon = Math.max(1, Math.min(18, Math.round(input.horizon)));
  const assumptions = [
    "Fits a straight-line trend to the monthly totals you already have.",
    "Layers a month-of-year index on top when there is at least a year of history.",
    "The band is an 80% range from how far past months fell from the trend, not a guarantee.",
  ];

  if (history.length === 0) {
    return { points: [], total: 0, method: "average", confidence: 0, trendPerMonth: 0, backtest: null, assumptions: ["No spending history yet."] };
  }

  const startMonth = history[history.length - 1]?.month;
  if (!startMonth) {
    return { points: [], total: 0, method: "average", confidence: 0, trendPerMonth: 0, backtest: null, assumptions: ["No spending history yet."] };
  }
  const values = history.map((point) => point.value);
  const months = history.map((point) => point.month);
  const seasonality = history.length >= 12;
  const model = fit(values, months, seasonality);

  const points: ForecastPoint[] = [];
  for (let i = 1; i <= horizon; i++) {
    const month = addMonths(`${startMonth}-01`, i).slice(0, 7);
    const { value, margin } = predictAt(model, month, values.length - 1 + i, values.length);
    points.push({
      month,
      forecast: Math.round(value),
      low: Math.round(Math.max(0, value - margin)),
      high: Math.round(value + margin),
    });
  }

  // Backtest: fit on everything but the last few months, then predict them.
  const holdout = Math.min(3, Math.max(0, history.length - 2));
  let backtest: Backtest | null = null;
  if (holdout >= 2) {
    const train = values.slice(0, values.length - holdout);
    const trainMonths = months.slice(0, months.length - holdout);
    const testFit = fit(train, trainMonths, seasonality && train.length >= 12);
    let absolute = 0;
    let percent = 0;
    let percentCount = 0;
    for (let i = 0; i < holdout; i++) {
      const actual = values[train.length + i] ?? 0;
      const { value } = predictAt(testFit, months[train.length + i] ?? "", train.length + i, train.length);
      absolute += Math.abs(actual - value) / holdout;
      if (actual > 0) {
        percent += Math.abs(actual - value) / actual;
        percentCount++;
      }
    }
    const mape = percentCount ? percent / percentCount : null;
    backtest = {
      months: holdout,
      mae: Math.round(absolute),
      mape: mape === null ? null : Math.round(mape * 1000) / 1000,
      accuracy: mape === null ? null : Math.round(Math.max(0, 1 - mape) * 100),
    };
  }

  const mean = sum(values) / values.length;
  const cv = mean > 0 ? model.residualStd / mean : 0.5;
  const base = clampNumber(100 - cv * 90, 25, 96);
  const lengthBonus = Math.min(8, history.length);
  const confidence = Math.round(clampNumber(base + lengthBonus - (backtest?.mape ? backtest.mape * 30 : 0), 15, 97));

  return {
    points,
    total: points.reduce((total, point) => total + point.forecast, 0),
    method: seasonality ? "trend+seasonality" : history.length >= 4 ? "trend" : "average",
    confidence,
    trendPerMonth: Math.round(model.slope),
    backtest,
    assumptions: seasonality ? assumptions : ["Fits a straight-line trend to the monthly totals you already have.", "The band is an 80% range from how far past months fell from the trend, not a guarantee."],
  };
}
