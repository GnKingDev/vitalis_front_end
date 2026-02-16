import React, { useState, useMemo, useEffect } from 'react';
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
          
          // Patient: use the one from API response if present, otherwise fetch by id
          if (resultData.patient) {
            setPatient(resultData.patient);
          } else if (resultData.patientId) {
            const patientResponse = await getPatientById(resultData.patientId);
            if (patientResponse.success && patientResponse.data) {
              setPatient(patientResponse.data);
            }
          }
          
          // Doctor: use the one from API response if present
          if (resultData.doctor) {
            setDoctor(resultData.doctor);
          }
          
          // Load consultation for lab requests (only if needed and id is present)
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
  const rawLabData = isLab ? (result.data as any) : null;
  // API may put exams in request.exams or at root
  const labExams = rawLabData ? (rawLabData.request?.exams ?? rawLabData.exams ?? []) : [];
  // results can be object (e.g. { id, validatedBy, validatedAt }) or array of parameter results; ensure we always have an array
  const rawResults = rawLabData?.results;
  const labResultsArray = Array.isArray(rawResults)
    ? rawResults
    : (rawResults && typeof rawResults === 'object' && Array.isArray((rawResults as any).results)
        ? (rawResults as any).results
        : []);
  const labRequest = isLab ? { ...rawLabData, exams: labExams, results: labResultsArray } : null;
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
            description={`Détails des résultats - ${(result.data as any).request?.id ?? (result.data as any).id ?? id}`}
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
                  {(result.data as any).request?.id ?? result.data.id}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Date de réception</Label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {(() => {
                    const dateVal = (result.data as any).completedAt ?? (result.data as any).updatedAt;
                    if (!dateVal) return '—';
                    const d = new Date(dateVal);
                    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  })()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Content - API: results[] with results.results.sections[].items[] (name, value, unit, reference) */}
      {isLab && labRequest ? (
        <div className="space-y-6">
          {labRequest.exams.map((exam, examIndex) => {
            const resultsList = Array.isArray(labRequest.results) ? labRequest.results : [];
            const resultDoc = resultsList[0];
            const sections = resultDoc?.results?.results?.sections ?? resultDoc?.results?.sections ?? [];
            const section = sections.find((s: any) => (s.title || '').trim() === (exam.name || '').trim());
            const items: { name?: string; value?: string; unit?: string; reference?: string }[] = section?.items ?? [];
            const technicianNotes = resultDoc?.technicianNotes;

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
                  {items.length > 0 ? (
                    <div className="space-y-4">
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
                            {items.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.name ?? '—'}</TableCell>
                                <TableCell>
                                  <span className="font-medium">{item.value ?? '—'}</span>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {item.unit ?? '—'}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {item.reference ?? '—'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {technicianNotes && (
                        <div className="p-3 rounded-lg bg-secondary/20 border">
                          <p className="text-sm font-semibold mb-1">Notes du technicien</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {technicianNotes}
                          </p>
                        </div>
                      )}
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
