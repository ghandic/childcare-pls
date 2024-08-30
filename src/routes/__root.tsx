import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toaster";

export const Route = createRootRoute({
  component: () => (
    <React.Fragment>
      <Outlet />
      <Toaster />
    </React.Fragment>
  ),
});
