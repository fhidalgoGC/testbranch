import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Eye, MoreVertical, FileOutput, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

// Mock data - later we'll replace with real API data
const mockContracts = [
  {
    id: 'SPC-48',
    customer: 'Andrés band...',
    date: '7/23/2025',
    quantity: '1.700,00 bu56.',
    price: '$ 370',
    basis: '$ 0',
    type: 'fixed',
    avatar: 'AB'
  },
  {
    id: 'SPC-47',
    customer: 'Test Seller ...',
    date: '7/23/2025',
    quantity: '1.500,00 longTon.',
    price: '$ 1500',
    basis: '$ 0',
    type: 'fixed',
    avatar: 'TS'
  },
  {
    id: 'SPC-46',
    customer: 'Test Seller ...',
    date: '7/31/2025',
    quantity: '1.400,00 bu60.',
    price: '$ 0',
    basis: '$ 1500',
    type: 'basis',
    avatar: 'TS'
  },
  {
    id: 'SPC-44',
    customer: 'Ferti Nova',
    date: '7/3/2025',
    quantity: '500.000,00 bu56.',
    price: '$ 3000',
    basis: '$ -1.75',
    type: 'fixed',
    avatar: 'FN'
  },
  {
    id: 'SPC-41',
    customer: 'Ferti Nova',
    date: '7/3/2025',
    quantity: '4.000,00 lb.',
    price: '$ 6000',
    basis: '$ -1.75',
    type: 'fixed',
    avatar: 'FN'
  }
];

const commodityFilters = [
  'YC - Yellow C...',
  'Soya 2025',
  'Semillas de gi...',
  'HRW - Wheat...',
  'Maíz Blanco',
  'SRW - Wheat...',
  'Frijol amarillo 1'
];

const ContractActionMenu = ({ contract }: { contract: any }) => {
  const getMenuItems = (contractType: string) => {
    // Different menu items based on contract type
    if (contractType === 'basis') {
      return [
        { icon: Eye, label: 'View' },
        { icon: UserPlus, label: 'Add Sub Contract' },
        { icon: FileOutput, label: 'Contract PDF' }
      ];
    } else {
      return [
        { icon: Eye, label: 'View' },
        { icon: FileOutput, label: 'Contract PDF' }
      ];
    }
  };

  const menuItems = getMenuItems(contract.type);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {menuItems.map((item, index) => (
          <DropdownMenuItem key={index}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const EmptyState = ({ onCreateContract }: { onCreateContract: () => void }) => {
  const { t } = useTranslation();
  
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold">No purchase contracts yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start by creating your first purchase contract.
          </p>
        </div>
        <Button 
          onClick={onCreateContract}
          className="mt-6"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create First Contract
        </Button>
      </CardContent>
    </Card>
  );
};

export default function PurchaseContracts() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<'basis' | 'fixed'>('basis');
  const [selectedCommodities, setSelectedCommodities] = useState<string[]>([]);
  
  // For now showing empty state to test the mockup, later we'll add real API
  const [contracts] = useState([]);  // Changed to empty array to show empty state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleCreateContract = () => {
    setLocation('/purchase-contract-form');
  };

  const toggleCommodityFilter = (commodity: string) => {
    setSelectedCommodities(prev => 
      prev.includes(commodity) 
        ? prev.filter(c => c !== commodity)
        : [...prev, commodity]
    );
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesType = contract.type === activeFilter;
    // Later we'll add commodity filtering logic
    return matchesType;
  });

  const totalPages = Math.ceil(filteredContracts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, startIndex + rowsPerPage);

  if (contracts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Purchase Contracts</h1>
            <p className="text-muted-foreground">
              Purchase contract management for commodities
            </p>
          </div>
          <Button onClick={handleCreateContract} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Contract
          </Button>
        </div>
        <EmptyState onCreateContract={handleCreateContract} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Purchase Contracts</h1>
          <p className="text-muted-foreground">
            Purchase contract management for commodities
          </p>
        </div>
        <Button onClick={handleCreateContract} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Contract
        </Button>
      </div>

      {/* Content Card */}
      <Card>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="space-y-4">
            {/* Basis/Fixed Filter */}
            <div className="flex space-x-2">
              <Button
                variant={activeFilter === 'basis' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('basis')}
                className="rounded-full"
              >
                Basis
              </Button>
              <Button
                variant={activeFilter === 'fixed' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('fixed')}
                className="rounded-full"
              >
                Fixed
              </Button>
            </div>

            {/* Commodity Filters */}
            <div className="flex flex-wrap gap-2">
              {commodityFilters.map((commodity, index) => (
                <Badge
                  key={index}
                  variant={selectedCommodities.includes(commodity) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleCommodityFilter(commodity)}
                >
                  {commodity}
                </Badge>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Basis</TableHead>
                  <TableHead>Id</TableHead>
                  <TableHead className="w-[50px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {contract.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span>{contract.customer}</span>
                      </div>
                    </TableCell>
                    <TableCell>{contract.date}</TableCell>
                    <TableCell>{contract.quantity}</TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">{contract.price}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        contract.basis.includes('-') ? 'text-red-500' : 
                        contract.basis === '$ 0' ? 'text-blue-600' : 'text-blue-600'
                      }`}>
                        {contract.basis}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{contract.id}</TableCell>
                    <TableCell>
                      <ContractActionMenu contract={contract} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredContracts.length)} of {filteredContracts.length}
              </span>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  ⇤
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  ‹
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  ›
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  ⇥
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}