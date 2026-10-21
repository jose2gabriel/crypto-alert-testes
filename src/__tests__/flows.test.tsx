import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import { AlertProvider } from "@context/AlertProvider/AlertProvider";
import { CreateAlertScreen } from "@screens/CreateAlertScreen/CreateAlertScreen";
import { CryptoListScreen } from "@screens/CryptoListScreen/CryptoListScreen";
import { PriceAlertsScreen } from "@screens/PriceAlertsScreen/PriceAlertsScreen";

describe("fluxos completos", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => jest.restoreAllMocks());

  it("cria um alerta pelo formulário, exibe na lista de alertas e permite excluí-lo", async () => {
    await render(
      <AlertProvider>
        <CreateAlertScreen />
        <PriceAlertsScreen />
      </AlertProvider>,
    );

    expect(screen.getByText("No alerts yet")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Save Alert" })).toBeDisabled();

    await fireEvent.press(screen.getByRole("button", { name: /Select cryptocurrency/ }));
    await fireEvent.press(screen.getByText("Ethereum"));
    await fireEvent.changeText(screen.getByPlaceholderText("0.00"), "3000");
    await fireEvent.press(screen.getByRole("radio", { name: /Below target price/ }));
    await fireEvent.press(screen.getByRole("button", { name: "Save Alert" }));

    expect(screen.getByText("Ethereum")).toBeOnTheScreen();
    expect(screen.getByText("below")).toBeOnTheScreen();
    expect(screen.getByText("$3,000.00")).toBeOnTheScreen();
    expect(screen.queryByText("No alerts yet")).not.toBeOnTheScreen();
    expect(router.replace).toHaveBeenCalledWith("/alerts");
    await waitFor(async () =>
      expect(await AsyncStorage.getItem("cryptoAlerts")).toContain("Ethereum"),
    );

    await fireEvent.press(screen.getByRole("button", { name: "Delete alert" }));
    expect(screen.getByText("No alerts yet")).toBeOnTheScreen();
  });

  it("lista as moedas da API e mostra os alertas salvos no armazenamento local para cada moeda", async () => {
    await AsyncStorage.setItem(
      "cryptoAlerts",
      JSON.stringify([
        {
          id: "1",
          cryptocurrency: "Bitcoin",
          symbol: "BTC",
          targetPrice: 80000,
          condition: "above",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        { id: "bitcoin", name: "Bitcoin", symbol: "btc", current_price: 50000, price_change_percentage_24h: 1.5, image: "" },
        { id: "ethereum", name: "Ethereum", symbol: "eth", current_price: 3000, price_change_percentage_24h: -2, image: "" },
      ],
    } as Response);

    await render(
      <AlertProvider>
        <CryptoListScreen />
      </AlertProvider>,
    );

    expect(await screen.findByText("Bitcoin")).toBeOnTheScreen();
    expect(screen.getByText("$50,000.00")).toBeOnTheScreen();
    expect(screen.getByText("+1.50%")).toBeOnTheScreen();
    expect(screen.getByText("-2.00%")).toBeOnTheScreen();

    const badge = await screen.findByRole("button", {
      name: "Toggle alerts for this cryptocurrency",
    });
    expect(screen.getByText("1 alert")).toBeOnTheScreen();

    await fireEvent.press(badge);
    expect(screen.getByText("Above target")).toBeOnTheScreen();
    expect(screen.getByText("$80,000.00")).toBeOnTheScreen();
  });
});
