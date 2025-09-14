import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ConfirmModal, ConfirmModalProps } from "../../../components/confirm-modal";

describe("ConfirmModal component", () => {
  const defaultProps: ConfirmModalProps = {
    isOpen: true,
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
    title: "Test Title",
    description: "Test description",
    // confirmButtonText și cancelButtonText folosesc valorile implicite („Confirmă” și „Anulează”)
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("randează titlul, descrierea și butoanele implicite când isOpen=true", () => {
    render(<ConfirmModal {...defaultProps} />);

    // Verificăm că titlul și descrierea apar în document
    expect(screen.getByRole("heading", { name: /Test Title/i })).toBeInTheDocument();
    expect(screen.getByText(/Test description/i)).toBeInTheDocument();

    // Butoanele implicite
    expect(screen.getByRole("button", { name: "Anulează" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmă" })).toBeInTheDocument();

    // Butonul X (arată prin aria-label-ul implicit al iconiței sau textul din componentă)
    // În componenta ta, butonul X nu are aria-label, așa că vom căuta butonul care conține iconița
    const closeButton = screen.getByRole("button", { name: "" });
    expect(closeButton).toBeInTheDocument();
  });

  it("nu randează nimic când isOpen=false", () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />);

    // Atât titlul, cât și descrierea nu trebuie să existe în DOM
    expect(screen.queryByText(/Test Title/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Test description/i)).not.toBeInTheDocument();
    // Butoanele nu trebuie să existe
    expect(screen.queryByRole("button", { name: "Anulează" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirmă" })).not.toBeInTheDocument();
  });

  it("apelează onCancel când se dă click pe butonul 'Anulează'", () => {
    render(<ConfirmModal {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: "Anulează" });
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("apelează onCancel când se dă click pe butonul X (închidere)", () => {
    render(<ConfirmModal {...defaultProps} />);

    // În componenta, butonul X nu are text, deci îl obținem altfel:
    // Observă că iconița X are dimensiunea h-5 w-5; putem căuta butonul care conține un element SVG.
    const closeButton = screen.getByRole("button", { name: "" });
    fireEvent.click(closeButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("apelează onConfirm când se dă click pe butonul 'Confirmă'", () => {
    render(<ConfirmModal {...defaultProps} />);

    const confirmButton = screen.getByRole("button", { name: "Confirmă" });
    fireEvent.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("suportă texte personalizate pentru butoane", () => {
    const customProps: ConfirmModalProps = {
      ...defaultProps,
      confirmButtonText: "Da, șterge",
      cancelButtonText: "Nu, renunț",
    };
    render(<ConfirmModal {...customProps} />);

    // Verificăm că apar textele personalizate
    expect(screen.getByRole("button", { name: "Nu, renunț" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Da, șterge" })).toBeInTheDocument();

    // Apelăm funcțiile pentru a ne asigura că sunt conectate corect
    fireEvent.click(screen.getByRole("button", { name: "Nu, renunț" }));
    expect(customProps.onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Da, șterge" }));
    expect(customProps.onConfirm).toHaveBeenCalledTimes(1);
  });
});
