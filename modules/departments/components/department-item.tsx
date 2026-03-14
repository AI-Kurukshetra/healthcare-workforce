"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { updateDepartment, deleteDepartment, updateUnit, deleteUnit } from "../actions";
import { showSuccess, showError } from "@/lib/utils/toast";
import { Edit2, Trash2, Building2, Plus } from "lucide-react";
import UnitForm from "./unit-form";

export function DepartmentItem({ dept }: { dept: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(dept.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);

  const handleUpdate = async () => {
    if (!editName.trim() || editName === dept.name) {
      setIsEditing(false);
      setEditName(dept.name);
      return;
    }
    try {
      await updateDepartment({ id: dept.id, name: editName });
      showSuccess("Department updated");
      setIsEditing(false);
    } catch (err: any) {
      showError(err.message ?? "Failed to update department");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDepartment(dept.id);
      showSuccess("Department deleted");
    } catch (err: any) {
      showError(err.message ?? "Failed to delete department");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          {isEditing ? (
            <div className="flex flex-1 items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdate();
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditName(dept.name);
                  }
                }}
              />
              <Button size="sm" onClick={handleUpdate}>
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditName(dept.name);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex flex-1 items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-600" />
              <CardTitle className="text-lg font-bold">{dept.name}</CardTitle>
            </div>
          )}

          {!isEditing && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 text-slate-500" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {dept.units && dept.units.length > 0 ? (
            <div className="space-y-2 mt-2">
              <p className="text-sm font-medium text-slate-500 mb-2">Units in this department:</p>
              {dept.units.map((unit: any) => (
                <UnitItem key={unit.id} unit={unit} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 mt-2">No units assigned to this department yet.</p>
          )}

          {showAddUnit ? (
            <div className="mt-4 border-t pt-4">
              <UnitForm departmentId={dept.id} onSuccess={() => setShowAddUnit(false)} />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => setShowAddUnit(false)}
              >
                Cancel Adding Unit
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 flex items-center gap-1"
              onClick={() => setShowAddUnit(true)}
            >
              <Plus className="h-4 w-4" /> Add Unit
            </Button>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Department"
        message={`Are you sure you want to delete "${dept.name}"? This action will also delete all associated units and cannot be undone.`}
        confirmLabel="Delete Department"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

function UnitItem({ unit }: { unit: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(unit.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = async () => {
    if (!editName.trim() || editName === unit.name) {
      setIsEditing(false);
      setEditName(unit.name);
      return;
    }
    try {
      await updateUnit({ id: unit.id, name: editName });
      showSuccess("Unit updated");
      setIsEditing(false);
    } catch (err: any) {
      showError(err.message ?? "Failed to update unit");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUnit(unit.id);
      showSuccess("Unit deleted");
    } catch (err: any) {
      showError(err.message ?? "Failed to delete unit");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
        {isEditing ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdate();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditName(unit.name);
                }
              }}
            />
            <Button size="sm" className="h-8 px-2" onClick={handleUpdate}>
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => {
                setIsEditing(false);
                setEditName(unit.name);
              }}
            >
              X
            </Button>
          </div>
        ) : (
          <>
            <span className="text-sm font-medium text-slate-700">{unit.name}</span>
            <div className="flex items-center gap-1 opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100 group-hover:opacity-100 [&:hover]:opacity-100">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                   // Ensure hover target has child interactive elements explicitly shown in code
                   e.currentTarget.parentElement?.classList.remove('opacity-0');
                   setIsEditing(true);
                }}
              >
                <Edit2 className="h-3.5 w-3.5 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                    e.currentTarget.parentElement?.classList.remove('opacity-0');
                    setShowDeleteConfirm(true);
                }}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
            {/* Fallback for touch devices or if hover isn't triggering */}
            <div className="flex items-center gap-1 md:hidden">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Unit"
        message={`Are you sure you want to delete "${unit.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
