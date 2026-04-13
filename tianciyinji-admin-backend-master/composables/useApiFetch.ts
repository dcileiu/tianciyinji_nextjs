import { useNuxtApp } from "#app";

export const useApiFetch = () => {
  const { $api } = useNuxtApp();
  return $api;
};
