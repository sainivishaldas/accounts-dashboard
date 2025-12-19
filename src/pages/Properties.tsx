import { useState } from "react";
import { Plus, Pencil, MoreHorizontal, Building2, MapPin, Phone, User } from "lucide-react";
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
import { StatusBadge, type PropertyStatus } from "@/components/ui/StatusBadge";

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  numberOfUnits: number;
  propertyManagerName: string;
  propertyManagerNumber: string;
  status: PropertyStatus;
}

const initialProperties: Property[] = [
  {
    id: "PROP001",
    name: "Truliv Koramangala",
    address: "123 Koramangala 5th Block, Near Forum Mall",
    city: "Bangalore",
    numberOfUnits: 45,
    propertyManagerName: "Rajesh Kumar",
    propertyManagerNumber: "+91 98765 43210",
    status: "active",
  },
  {
    id: "PROP002",
    name: "Truliv HSR Layout",
    address: "456 HSR Layout Sector 2, Near Agara Lake",
    city: "Bangalore",
    numberOfUnits: 32,
    propertyManagerName: "Priya Sharma",
    propertyManagerNumber: "+91 98765 43211",
    status: "active",
  },
  {
    id: "PROP003",
    name: "Truliv Indiranagar",
    address: "789 Indiranagar 100ft Road",
    city: "Bangalore",
    numberOfUnits: 28,
    propertyManagerName: "Amit Patel",
    propertyManagerNumber: "+91 98765 43212",
    status: "active",
  },
  {
    id: "PROP004",
    name: "Truliv Gurgaon",
    address: "321 Sector 54, Golf Course Road",
    city: "Gurgaon",
    numberOfUnits: 56,
    propertyManagerName: "Neha Gupta",
    propertyManagerNumber: "+91 98765 43213",
    status: "active",
  },
  {
    id: "PROP005",
    name: "Truliv Whitefield",
    address: "555 Whitefield Main Road, Near Phoenix Mall",
    city: "Bangalore",
    numberOfUnits: 40,
    propertyManagerName: "Suresh Reddy",
    propertyManagerNumber: "+91 98765 43214",
    status: "inactive",
  },
];

const emptyProperty: Omit<Property, 'id'> = {
  name: "",
  address: "",
  city: "",
  numberOfUnits: 0,
  propertyManagerName: "",
  propertyManagerNumber: "",
  status: "active",
};

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<Omit<Property, 'id'>>(emptyProperty);

  const handleOpenDialog = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        name: property.name,
        address: property.address,
        city: property.city,
        numberOfUnits: property.numberOfUnits,
        propertyManagerName: property.propertyManagerName,
        propertyManagerNumber: property.propertyManagerNumber,
        status: property.status,
      });
    } else {
      setEditingProperty(null);
      setFormData(emptyProperty);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingProperty) {
      setProperties(properties.map(p => 
        p.id === editingProperty.id 
          ? { ...p, ...formData }
          : p
      ));
    } else {
      const newProperty: Property = {
        id: `PROP${String(properties.length + 1).padStart(3, '0')}`,
        ...formData,
      };
      setProperties([...properties, newProperty]);
    }
    setIsDialogOpen(false);
    setEditingProperty(null);
    setFormData(emptyProperty);
  };

  const toggleStatus = (id: string) => {
    setProperties(properties.map(p => 
      p.id === id 
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
        : p
    ));
  };

  const activeCount = properties.filter(p => p.status === 'active').length;
  const inactiveCount = properties.filter(p => p.status === 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Properties</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} Active • {inactiveCount} Inactive
          </p>
        </div>
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
                  value={formData.numberOfUnits}
                  onChange={(e) => setFormData({ ...formData, numberOfUnits: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pmName">Property Manager Name</Label>
                <Input
                  id="pmName"
                  value={formData.propertyManagerName}
                  onChange={(e) => setFormData({ ...formData, propertyManagerName: e.target.value })}
                  placeholder="Manager name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pmNumber">Property Manager Number</Label>
                <Input
                  id="pmNumber"
                  value={formData.propertyManagerNumber}
                  onChange={(e) => setFormData({ ...formData, propertyManagerNumber: e.target.value })}
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
                <td className="text-center">{property.numberOfUnits}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {property.propertyManagerName}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {property.propertyManagerNumber}
                  </div>
                </td>
                <td>
                  <StatusBadge status={property.status} />
                </td>
                <td>
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
                      <DropdownMenuItem onClick={() => toggleStatus(property.id)}>
                        {property.status === 'active' ? 'Mark Inactive' : 'Mark Active'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
