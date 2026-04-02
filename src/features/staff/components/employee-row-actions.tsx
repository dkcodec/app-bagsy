"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  MoreHorizontal,
  User,
  Shield,
  ArrowRightLeft,
  UserCheck,
  UserX,
  Unlink,
} from "lucide-react";
import { Button } from "@/src/entities/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/entities/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/entities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/widgets/forms/dropdown-menu";
import type { IEmployeeDto, TUserRole } from "@/src/shared/types/user";
import { ESubscriptionPlan, EUserRole } from "@/src/shared/types/user";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useLocations } from "@/src/shared/hooks/use-network-locations";
import {
  useChangeEmployeeRole,
  useTransferEmployee,
  useActivateEmployee,
  useDeactivateEmployee,
  useRemoveEmployeeFromLocation,
} from "@/src/shared/hooks/user-staff";

interface EmployeeRowActionsProps {
  employee: IEmployeeDto;
  onViewProfile: () => void;
}

/**
 * DropdownMenu для строки сотрудника:
 * View profile, Change role, Transfer, Separator, Activate/Deactivate
 */
export function EmployeeRowActions({
  employee,
  onViewProfile,
}: EmployeeRowActionsProps) {
  const td = useTranslations("Staff.drawer");
  const tRoles = useTranslations("Staff.roles");
  const { data: currentUser } = useCurrentUser();

  // Dialogs state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [detachDialogOpen, setDetachDialogOpen] = useState(false);

  // Selected values
  const [selectedRole, setSelectedRole] = useState<TUserRole>(employee.role);
  const [selectedLocation, setSelectedLocation] = useState("");

  // Mutations
  const changeRole = useChangeEmployeeRole();
  const transfer = useTransferEmployee();
  const activate = useActivateEmployee();
  const deactivate = useDeactivateEmployee();
  const detach = useRemoveEmployeeFromLocation();

  // Locations для transfer (только owner видит список)
  const { data: locationsData } = useLocations();
  const locations = locationsData?.locations || [];

  // Проверки доступа
  const isOwner = currentUser?.role === EUserRole.OWNER;
  const isSelf = currentUser?.id === employee.id;
  const plan = currentUser?.organization?.subscription?.plan;
  const isSoloPlan = plan === ESubscriptionPlan.SOLO;
  const isNetworkPlan = plan === ESubscriptionPlan.NETWORK;

  const canChangeRole = isOwner && !isSelf;
  const canTransfer = isOwner && isNetworkPlan;
  const canDetach = isOwner && !isSelf;

  // Handlers
  const handleChangeRole = () => {
    changeRole.mutate(
      { id: employee.id, role: selectedRole },
      { onSuccess: () => setRoleDialogOpen(false) }
    );
  };

  const handleTransfer = () => {
    if (!selectedLocation) return;
    transfer.mutate(
      { id: employee.id, location_id: selectedLocation },
      { onSuccess: () => setTransferDialogOpen(false) }
    );
  };

  const handleDeactivate = () => {
    deactivate.mutate(employee.id, {
      onSuccess: () => setDeactivateDialogOpen(false),
    });
  };

  const handleActivate = () => {
    activate.mutate(employee.id);
  };

  const handleDetach = () => {
    detach.mutate(employee.id, {
      onSuccess: () => setDetachDialogOpen(false),
    });
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={e => e.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* View profile */}
          <DropdownMenuItem onClick={onViewProfile}>
            <User className="mr-2 size-4" />
            {td("viewProfile")}
          </DropdownMenuItem>

          {/* Change role — только owner, не себе */}
          {canChangeRole && (
            <DropdownMenuItem
              onClick={() => {
                setSelectedRole(employee.role);
                setRoleDialogOpen(true);
              }}
            >
              <Shield className="mr-2 size-4" />
              {td("changeRole")}
            </DropdownMenuItem>
          )}

          {/* Transfer — только owner + network */}
          {canTransfer && (
            <DropdownMenuItem
              onClick={() => {
                setSelectedLocation("");
                setTransferDialogOpen(true);
              }}
            >
              <ArrowRightLeft className="mr-2 size-4" />
              {td("transfer")}
            </DropdownMenuItem>
          )}

          {/* Detach from location — только owner, не себе */}
          {canDetach && (
            <DropdownMenuItem
              onClick={() => setDetachDialogOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Unlink className="mr-2 size-4" />
              {td("detach")}
            </DropdownMenuItem>
          )}

          {/* Activate / Deactivate — скрыт на solo */}
          {!isSoloPlan && (
            <>
              <DropdownMenuSeparator />
              {employee.active ? (
                <DropdownMenuItem
                  onClick={() => setDeactivateDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <UserX className="mr-2 size-4" />
                  {td("deactivate")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleActivate}>
                  <UserCheck className="mr-2 size-4" />
                  {td("activate")}
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog: Change Role */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent
          className="sm:max-w-sm"
          onClick={e => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>{td("changeRoleTitle")}</DialogTitle>
            <DialogDescription>{td("changeRoleDesc")}</DialogDescription>
          </DialogHeader>
          <Select
            value={selectedRole}
            onValueChange={v => setSelectedRole(v as TUserRole)}
          >
            <SelectTrigger>
              <SelectValue placeholder={td("selectRole")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">{tRoles("manager")}</SelectItem>
              <SelectItem value="staff">{tRoles("staff")}</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              {td("cancel")}
            </Button>
            <Button
              onClick={handleChangeRole}
              disabled={changeRole.isPending || selectedRole === employee.role}
            >
              {td("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Transfer */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent
          className="sm:max-w-sm"
          onClick={e => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>{td("transferTitle")}</DialogTitle>
            <DialogDescription>{td("transferDesc")}</DialogDescription>
          </DialogHeader>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder={td("selectLocation")} />
            </SelectTrigger>
            <SelectContent>
              {locations
                .filter(loc => loc.id !== employee.location_id)
                .map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setTransferDialogOpen(false)}
            >
              {td("cancel")}
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={transfer.isPending || !selectedLocation}
            >
              {td("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Deactivate confirmation */}
      <Dialog
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
      >
        <DialogContent
          className="sm:max-w-sm"
          onClick={e => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>{td("deactivateTitle")}</DialogTitle>
            <DialogDescription>{td("deactivateDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeactivateDialogOpen(false)}
            >
              {td("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivate.isPending}
            >
              {td("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Detach from location */}
      <Dialog open={detachDialogOpen} onOpenChange={setDetachDialogOpen}>
        <DialogContent
          className="sm:max-w-sm"
          onClick={e => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>{td("detachTitle")}</DialogTitle>
            <DialogDescription>
              {td("detachDesc", {
                name: `${employee.first_name} ${employee.last_name}`,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDetachDialogOpen(false)}
            >
              {td("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDetach}
              disabled={detach.isPending}
            >
              {td("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
