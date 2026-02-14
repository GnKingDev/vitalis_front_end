import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  FileText,
  Eye,
  User,
  Stethoscope,
  Calendar,
  Search,
  Filter,
  XCircle,
} from 'lucide-react';
import {
  mockPrescriptions,
  mockPatients,
  mockUsers,
} from '@/data/mockData';
import type { Prescription } from '@/types';

const PharmacyPrescriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent_to_pharmacy' | 'preparing'>('all');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatus, setAppliedStatus] = useState<'all' | 'sent_to_pharmacy' | 'preparing'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  // Filtrer les ordonnances à traiter
  const prescriptionsToProcess = useMemo(() => {
    return mockPrescriptions.filter(
      (p) => p.status === 'sent_to_pharmacy' || p.status === 'preparing'
    );
  }, []);

  // Obtenir le patient
  const getPatient = (patientId: string) => {
    return mockPatients.find((p) => p.id === patientId);
  };

  // Obtenir le médecin
  const getDoctor = (doctorId: string) => {
    return mockUsers.find((u) => u.id === doctorId);
  };

  // Filtrer les ordonnances
  const filteredPrescriptions = useMemo(() => {
    let filtered = prescriptionsToProcess;

    // Filtrer par statut
    if (appliedStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === appliedStatus);
    }

    // Filtrer par recherche
    if (appliedSearch) {
      const query = appliedSearch.toLowerCase().trim();
      filtered = filtered.filter((prescription) => {
        const patient = getPatient(prescription.patientId);
        const doctor = getDoctor(prescription.doctorId);
        return (
          patient?.firstName.toLowerCase().includes(query) ||
          patient?.lastName.toLowerCase().includes(query) ||
          patient?.vitalisId.toLowerCase().includes(query) ||
          doctor?.name.toLowerCase().includes(query) ||
          prescription.id.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [prescriptionsToProcess, appliedStatus, appliedSearch]);

  // Pagination
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPrescriptions = filteredPrescriptions.slice(startIndex, endIndex);

  // Réinitialiser la page quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1);
  }, [appliedStatus, appliedSearch]);

  // Appliquer les filtres
  const handleApplyFilters = () => {
    setAppliedStatus(statusFilter);
    setAppliedSearch(searchQuery);
    setCurrentPage(1);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setAppliedStatus('all');
    setAppliedSearch('');
    setCurrentPage(1);
  };

  // Gérer la touche Entrée
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  // Naviguer vers la page de détail
  const openDetailPage = (prescription: Prescription) => {
    navigate(`/pharmacy/prescriptions/${prescription.id}`);
  };

  // Générer les numéros de page
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Statistiques
  const stats = useMemo(() => {
    const sent = filteredPrescriptions.filter((p) => p.status === 'sent_to_pharmacy');
    const preparing = filteredPrescriptions.filter((p) => p.status === 'preparing');

    return {
      total: filteredPrescriptions.length,
      sent: sent.length,
      preparing: preparing.length,
    };
  }, [filteredPrescriptions]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordonnances reçues"
        description="Gérer les ordonnances à traiter"
      />

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total ordonnances</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reçues</p>
                <p className="text-2xl font-bold text-info">{stats.sent}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-info opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En préparation</p>
                <p className="text-2xl font-bold text-warning">{stats.preparing}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Statut</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="sent_to_pharmacy">Reçues</SelectItem>
                  <SelectItem value="preparing">En préparation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Patient, ID Vitalis, médecin..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Appliquer les filtres
            </Button>
            <Button variant="outline" onClick={handleResetFilters} className="gap-2">
              <XCircle className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des ordonnances ({filteredPrescriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">Aucune ordonnance trouvée</p>
              <p className="text-sm">
                {appliedSearch || appliedStatus !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : 'Aucune ordonnance à traiter pour le moment'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Médecin</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Médicaments</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPrescriptions.map((prescription) => {
                    const patient = getPatient(prescription.patientId);
                    const doctor = getDoctor(prescription.doctorId);

                    return (
                      <TableRow key={prescription.id}>
                        <TableCell>
                          {patient ? (
                            <div>
                              <p className="font-medium">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {patient.vitalisId}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Patient introuvable</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{doctor?.name || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(prescription.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {prescription.items.slice(0, 2).map((item) => (
                              <Badge key={item.id} variant="outline" className="text-xs">
                                {item.medicationName.substring(0, 20)}...
                              </Badge>
                            ))}
                            {prescription.items.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{prescription.items.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              prescription.status === 'sent_to_pharmacy'
                                ? 'bg-info/10 text-info border-info'
                                : 'bg-warning/10 text-warning border-warning'
                            }
                          >
                            {prescription.status === 'sent_to_pharmacy' ? 'Reçue' : 'En préparation'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailPage(prescription)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredPrescriptions.length)} sur {filteredPrescriptions.length} ordonnance(s)
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page as number);
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default PharmacyPrescriptionsPage;
