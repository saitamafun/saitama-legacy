"use client";
import { useContext } from "react";
import { PermissionContext } from "../providers/PermissionProvider";

export function usePermission() {
  return useContext(
    PermissionContext
  ) as import("../providers/PermissionProvider").PermissionContext;
}
