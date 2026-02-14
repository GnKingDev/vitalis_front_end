import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  Calendar,
  Stethoscope,
  Printer,
  TestTube2,
  Scan,
  FlaskConical,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { LabRequest, ImagingRequest, LabResult } from '@/types';
import { getDoctorResultById } from '@/services/api/doctorService';
import { getPatientById } from '@/services/api/patientsService';
import { getConsultationById } from '@/services/api/consultationsService';

const ResultDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [result, setResult] = useState<{ type: 'lab' | 'imaging'; data: any } | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [consultation, setConsultation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load result data
  useEffect(() => {
    const loadResult = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await getDoctorResultById(id);
        
        if (response.success && response.data) {
          const resultData = response.data;
          const resultType = resultData.type || (resultData.labRequestId ? 'lab' : 'imaging');
          
          setResult({
            type: resultType,
            data: resultData,
          });
          
          // Load patient
          if (resultData.patientId) {
            const patientResponse = await getPatientById(resultData.patientId);
            if (patientResponse.success && patientResponse.data) {
              setPatient(patientResponse.data);
            }
          }
          
          // Load doctor (from result data or separate call)
          if (resultData.doctor) {
            setDoctor(resultData.doctor);
          } else if (resultData.doctorId) {
            // If doctor not included, you might need a separate API call
            // For now, we'll use the doctor from result if available
            setDoctor(resultData.doctor);
          }
          
          // Load consultation for lab requests
          if (resultType === 'lab' && resultData.consultationId) {
            const consultResponse = await getConsultationById(resultData.consultationId);
            if (consultResponse.success && consultResponse.data) {
              setConsultation(consultResponse.data);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du résultat:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadResult();
  }, [id]);

  // Check if result exists
  if (!result) {
    return (
      <div className="space-y-6">
        <PageHeader title="Résultat introuvable" description="Ce résultat n'existe pas" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Le résultat est introuvable.</p>
            <p className="text-sm text-muted-foreground mb-4">ID recherché : {id}</p>
            <Button onClick={() => navigate('/doctor/lab-results')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if patient exists
  if (!patient) {
    return (
      <div className="space-y-6">
        <PageHeader title="Patient introuvable" description="Le patient associé à ce résultat n'existe pas" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Le patient associé à ce résultat est introuvable.</p>
            <Button onClick={() => navigate('/doctor/lab-results')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLab = result.type === 'lab';
  const labRequest = isLab ? (result.data as LabRequest) : null;
  const imagingRequest = !isLab ? (result.data as ImagingRequest) : null;

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/doctor/lab-results')}
          className="gap-2 mt-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div className="flex-1">
          <PageHeader
            title={isLab ? 'Résultats de laboratoire' : 'Résultats d\'imagerie'}
            description={`Détails des résultats - ${result.data.id}`}
          />
        </div>
      </div>

      {/* Patient and Doctor Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {isLab ? (
              <TestTube2 className="h-5 w-5 text-warning" />
            ) : (
              <Scan className="h-5 w-5 text-primary" />
            )}
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Patient</Label>
              <div className="mt-1 flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{patient.vitalisId}</p>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Médecin</Label>
              <div className="mt-1 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{doctor?.name || 'N/A'}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">N° Demande</Label>
              <div className="mt-1">
                <Badge variant="outline" className="font-mono">
                  {result.data.id}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Date de réception</Label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {new Date(result.data.updatedAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Content */}
      {isLab && labRequest ? (
        <div className="space-y-6">
          {labRequest.exams.map((exam, examIndex) => {
            // Find results for this exam
            const examResults = labRequest.results?.filter(r => r.examId === exam.id) || [];
            
            return (
              <Card key={exam.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    {exam.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{exam.category}</p>
                </CardHeader>
                <CardContent>
                  {examResults.length > 0 ? (
                    <div className="space-y-4">
                      {examResults.map((result, resultIndex) => {
                        // Parse multi-line values if they exist
                        const values = result.value.split('\n').filter(v => v.trim());
                        const referenceRanges = result.referenceRange?.split('\n').filter(r => r.trim()) || [];
                        const units = result.unit || '';
                        
                        return (
                          <div key={resultIndex} className="space-y-3">
                            {values.length > 1 ? (
                              // Multiple parameters (like NFS)
                              <div className="border rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[250px]">Paramètre</TableHead>
                                      <TableHead className="w-[150px]">Résultat</TableHead>
                                      <TableHead className="w-[100px]">Unités</TableHead>
                                      <TableHead className="w-[150px]">Valeurs de référence</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {values.map((value, idx) => {
                                      const paramName = value.split(':')[0]?.trim() || `Paramètre ${idx + 1}`;
                                      const paramValue = value.split(':')[1]?.trim() || value;
                                      const refRange = referenceRanges[idx] || result.referenceRange || '-';
                                      
                                      return (
                                        <TableRow key={idx}>
                                          <TableCell className="font-medium">{paramName}</TableCell>
                                          <TableCell>
                                            <span className="font-medium">{paramValue}</span>
                                          </TableCell>
                                          <TableCell className="text-sm text-muted-foreground">
                                            {units || '-'}
                                          </TableCell>
                                          <TableCell className="text-sm text-muted-foreground">
                                            {refRange}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              // Single parameter
                              <div className="border rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[250px]">Paramètre</TableHead>
                                      <TableHead className="w-[150px]">Résultat</TableHead>
                                      <TableHead className="w-[100px]">Unités</TableHead>
                                      <TableHead className="w-[150px]">Valeurs de référence</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell className="font-medium">{result.examName}</TableCell>
                                      <TableCell>
                                        <span className="font-medium">{result.value}</span>
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {result.unit || '-'}
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {result.referenceRange || '-'}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                            
                            {result.notes && (
                              <div className="p-3 rounded-lg bg-secondary/20 border">
                                <p className="text-sm font-semibold mb-1">Notes</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {result.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Aucun résultat disponible pour cet examen</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : imagingRequest ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Résultats d'imagerie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-semibold mb-3 block">Examens réalisés</Label>
              <div className="space-y-3">
                {imagingRequest.exams.map((exam) => (
                  <div key={exam.id} className="p-4 rounded-lg border bg-secondary/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{exam.name}</p>
                        <p className="text-sm text-muted-foreground">{exam.category}</p>
                      </div>
                      <Badge variant="outline" className="font-medium">
                        {exam.price.toLocaleString()} GNF
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {imagingRequest.results && (
              <div>
                <Label className="text-sm font-semibold mb-3 block">Résultats</Label>
                <div className="p-4 rounded-lg border bg-secondary/20">
                  <p className="text-sm whitespace-pre-wrap">{imagingRequest.results}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Comment sent to lab */}
      {isLab && consultation && consultation.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Commentaire envoyé au labo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-secondary/20 border">
              <p className="text-sm whitespace-pre-wrap">{consultation.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default ResultDetailPage;
