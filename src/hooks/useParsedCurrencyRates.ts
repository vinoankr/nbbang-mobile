import { CurrencyCode } from '../constants/currencies';
import { useCurrenciesRates } from './queries/useCurrencies';

export const useParsedCurrencyRates = () => {
  const { data: currenciesData, isLoading, isError } = useCurrenciesRates();
  const currencyMap = new Map<CurrencyCode, number>();

  currenciesData?.forEach((currency: any) => {
    currencyMap.set(currency.abbreviation, currency.exchange_rate);
  });

  const latestUpdatedAt = new Date(currenciesData?.[0]?.created_at).getTime();

  return {
    currencyMap,
    latestUpdatedAt,
    isLoading,
    isError
  };
}; 