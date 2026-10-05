import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./store";

export function renderWithProviders(
  ui,
  { preloadedState, route = "/", store } = {}
) {
  const testStore =
    store || configureStore({ reducer: rootReducer, preloadedState });
  const result = render(
    <Provider store={testStore}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>
  );
  return { store: testStore, ...result };
}
