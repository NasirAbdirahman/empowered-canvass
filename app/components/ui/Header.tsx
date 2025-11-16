import { Form, Link } from "react-router";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { Tooltip } from "./Tooltip";

type HeaderProps = {
  user: {
    name: string;
    email: string;
  };
  backButton?: {
    to: string;
    tooltip: string;
  };
};

export function Header({ user, backButton }: HeaderProps) {
  return (
    <header className="bg-surface border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            {backButton && (
              <Tooltip content={backButton.tooltip} position="bottom">
                <Link to={backButton.to}>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={backButton.tooltip}
                  >
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                </Link>
              </Tooltip>
            )}

            {/* App Name */}
            <div className="text-xl font-bold text-gray-900">Empowered Canvass</div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <Avatar name={user.name} size="md" />
            <Form method="post">
              <input type="hidden" name="intent" value="logout" />
              <Button type="submit" variant="secondary" size="sm">
                Logout
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </header>
  );
}
