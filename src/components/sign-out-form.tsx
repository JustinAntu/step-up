import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutForm() {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant="outline"
        className="min-h-11 touch-manipulation"
      >
        Sign out
      </Button>
    </form>
  );
}
