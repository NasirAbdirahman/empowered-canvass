import { useNavigation } from "react-router";

/**
 * Custom hook to track form submission state
 * Returns true when navigation state is "submitting"
 *
 * @returns boolean indicating if form is currently submitting
 *
 * @example
 * const isSubmitting = useFormSubmitting();
 * <Button type="submit" isLoading={isSubmitting}>Submit</Button>
 */
export function useFormSubmitting(): boolean {
  const navigation = useNavigation();
  return navigation.state === "submitting";
}
