import { useState } from "react";
import { Plus, Pencil, MoreHorizontal, Building2, MapPin, Phone, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useProperties, useCreateProperty, useUpdateProperty } from "@/hooks/useSupabase";
import { useAuth } from "@/contexts/AuthContext";
import { canCreateProperty, canEditProperty } from "@/lib/permissions";
import type { Property, PropertyStatus } from "@/types/database";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

interface FormData {
  name: string;
  address: string;
  city: string;
  number_of_units: number;
  property_manager_name: string;
  property_manager_number: string;
  status: PropertyStatus;
}

const emptyFormData: FormData = {
  name: "",
  address: "",
  city: "",
  number_of_units: 0,
  property_manager_name: "",
  property_manager_number: "",
  status: "active",
};

export default function Properties() {
  const { data: properties = [], isLoading } = useProperties();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const { userRole } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);

  const handleOpenDialog = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        name: property.name,
        address: property.address,
        city: property.city,
        number_of_units: property.number_of_units,
        property_manager_name: property.property_manager_name || '',
        property_manager_number: property.property_manager_number || '',
        status: property.status,
      });
    } else {
      setEditingProperty(null);
      setFormData(emptyFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingProperty) {
      await updateProperty.mutateAsync({
        id: editingProperty.id,
        updates: formData,
      });
    } else {
      const propertyId = `PROP${String(properties.length + 1).padStart(3, '0')}`;
      await createProperty.mutateAsync({
        property_id: propertyId,
        ...formData,
      });
    }
    setIsDialogOpen(false);
    setEditingProperty(null);
    setFormData(emptyFormData);
  };

  const toggleStatus = async (property: Property) => {
    await updateProperty.mutateAsync({
      id: property.id,
      updates: { status: property.status === 'active' ? 'inactive' : 'active' },
    });
  };

  const activeCount = properties.filter(p => p.status === 'active').length;
  const inactiveCount = properties.filter(p => p.status === 'inactive').length;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader title="Properties" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DashboardHeader title="Properties" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Properties</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} Active • {inactiveCount} Inactive
          </p>
        </div>
        {canCreateProperty(userRole) && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Property
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Truliv Koramangala"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Property Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Bangalore"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="units">Number of Units</Label>
                <Input
                  id="units"
                  type="number"
                  value={formData.number_of_units}
                  onChange={(e) => setFormData({ ...formData, number_of_units: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pmName">Property Manager Name</Label>
                <Input
                  id="pmName"
                  value={formData.property_manager_name}
                  onChange={(e) => setFormData({ ...formData, property_manager_name: e.target.value })}
                  placeholder="Manager name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pmNumber">Property Manager Number</Label>
                <Input
                  id="pmNumber"
                  value={formData.property_manager_number}
                  onChange={(e) => setFormData({ ...formData, property_manager_number: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingProperty ? 'Save Changes' : 'Add Property'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Properties Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="finance-table">
          <thead>
            <tr>
              <th>Property Name</th>
              <th>Address</th>
              <th>City</th>
              <th>Units</th>
              <th>Property Manager</th>
              <th>Contact</th>
              <th>Status</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{property.name}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2 max-w-[250px]">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate text-sm">{property.address}</span>
                  </div>
                </td>
                <td>{property.city}</td>
                <td className="text-center">{property.number_of_units}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {property.property_manager_name}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {property.property_manager_number}
                  </div>
                </td>
                <td>
                  <StatusBadge status={property.status} />
                </td>
                <td>
                  {canEditProperty(userRole) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(property)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus(property)}>
                          {property.status === 'active' ? 'Mark Inactive' : 'Mark Active'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      </div>
    </div>
  );
}
