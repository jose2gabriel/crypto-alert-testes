import { fireEvent, render, screen } from "@testing-library/react-native";
import { AlertCard } from "@components/AlertCard/AlertCard";
import { PrimaryButton } from "@components/PrimaryButton/PrimaryButton";

describe("componentes visuais", () => {
  it("AlertCard exibe os dados do alerta e chama onDelete com o id ao tocar em excluir", async () => {
    const onDelete = jest.fn();
    await render(
      <AlertCard
        alert={{
          id: "abc",
          cryptocurrency: "Bitcoin",
          symbol: "BTC",
          targetPrice: 70000,
          condition: "above",
          createdAt: "2026-01-01T00:00:00.000Z",
        }}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("Bitcoin")).toBeOnTheScreen();
    expect(screen.getByText("above")).toBeOnTheScreen();
    expect(screen.getByText("$70,000.00")).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole("button", { name: "Delete alert" }));
    expect(onDelete).toHaveBeenCalledWith("abc");
  });

  it("PrimaryButton mostra o rótulo e não dispara onPress quando está desabilitado", async () => {
    const onPress = jest.fn();
    const { rerender } = await render(
      <PrimaryButton label="Save Alert" onPress={onPress} disabled />,
    );

    const button = screen.getByRole("button", { name: "Save Alert" });
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();

    await rerender(<PrimaryButton label="Save Alert" onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "Save Alert" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
