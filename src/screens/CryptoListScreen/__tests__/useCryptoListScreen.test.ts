import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useCryptoListScreen } from "../useCryptoListScreen";

const apiCoin = {
  id: "bitcoin",
  name: "Bitcoin",
  symbol: "btc",
  current_price: 50000,
  price_change_percentage_24h: null,
  image: "https://example.com/btc.png",
};

function mockFetchResponse(ok: boolean, body: unknown = []) {
  return { ok, status: ok ? 200 : 500, json: async () => body } as Response;
}

describe("useCryptoListScreen", () => {
  afterEach(() => jest.restoreAllMocks());

  it("começa em loading e depois exibe as moedas mapeadas da API", async () => {
    let resolveFetch!: (response: Response) => void;
    jest
      .spyOn(global, "fetch")
      .mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)));

    const { result } = await renderHook(() => useCryptoListScreen());
    expect(result.current.loadingState).toBe("loading");

    await act(async () => resolveFetch(mockFetchResponse(true, [apiCoin])));

    await waitFor(() => expect(result.current.loadingState).toBe("idle"));
    expect(result.current.cryptocurrencies).toEqual([
      {
        id: "bitcoin",
        name: "Bitcoin",
        symbol: "BTC",
        price: 50000,
        change24h: 0,
        image: "https://example.com/btc.png",
      },
    ]);
  });

  it("vai para o estado de erro quando a API falha e se recupera ao tentar novamente", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(mockFetchResponse(false))
      .mockResolvedValueOnce(mockFetchResponse(true, [apiCoin]));

    const { result } = await renderHook(() => useCryptoListScreen());

    await waitFor(() => expect(result.current.loadingState).toBe("error"));

    await act(async () => {
      result.current.handleRetry();
    });

    await waitFor(() => expect(result.current.loadingState).toBe("idle"));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
