import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  FileText,
  FlaskConical,
  Eye,
  Send,
  Printer,
  FileDown,
  Calendar,
  Stethoscope,
  CreditCard,
  ListChecks,
  Loader2,
} from 'lucide-react';
import { getLabRequestById, saveLabResult, validateLabResult, sendLabResult, getLabResultById, getLabRequestPDF } from '@/services/api/labService';
import LabResultsFormComplete from '@/components/lab/LabResultsFormComplete';
import type { LabResultData } from '@/components/lab/LabResultsFormComplete';

const LabRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('exams');
  const [labRequest, setLabRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedResults, setSavedResults] = useState<LabResultData | null>(null);
  const [currentFormData, setCurrentFormData] = useState<LabResultData | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load lab request from API
  useEffect(() => {
    const loadLabRequest = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await getLabRequestById(id);

        if (response.success && response.data) {
          setLabRequest(response.data);
        } else {
          setLabRequest(null);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement de la demande:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger la demande de laboratoire',
        });
        setLabRequest(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadLabRequest();
  }, [id]);

  // Extract patient and doctor from labRequest
  const patient = labRequest?.patient || null;
  const doctor = labRequest?.doctor || null;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chargement..." description="Chargement de la demande" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Chargement des données...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if request exists
  if (!labRequest) {
    return (
      <div className="space-y-6">
        <PageHeader title="Demande introuvable" description="Cette demande n'existe pas" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">La demande de laboratoire est introuvable.</p>
            <p className="text-sm text-muted-foreground mb-4">ID recherché : {id}</p>
            <Button onClick={() => navigate('/lab/requests')} variant="outline">
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
        <PageHeader title="Patient introuvable" description="Le patient associé à cette demande n'existe pas" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Le patient associé à cette demande est introuvable.</p>
            <Button onClick={() => navigate('/lab/requests')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if request can be accessed (must be paid - have paymentId or payment.status === 'paid')
  // For lab role, only show requests that have been paid
  const isPaid = labRequest.paymentId || 
                 labRequest.payment?.id || 
                 labRequest.payment?.status === 'paid' ||
                 labRequest.status === 'paid';
  
  if (user?.role === 'lab' && !isPaid) {
    return (
      <div className="space-y-6">
        <PageHeader title="Demande non disponible" description="Cette demande ne peut pas être traitée" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Cette demande n'est pas encore payée. Elle ne peut pas être traitée pour le moment.
            </p>
            <Button onClick={() => navigate('/lab/requests')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate age
  const calculateAge = (dateOfBirth: string | null | undefined) => {
    if (!dateOfBirth) return 'N/A';
    try {
      const birth = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 'N/A';
    }
  };

  const handleSendToDoctorClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleSendToDoctor = async () => {
    if (!labRequest || !id) return;
    setIsConfirmDialogOpen(false);

    // Vérifier qu'on a un résultat sauvegardé
    // Note: results can be an object (from API) or array (from type definition)
    const resultsObj = Array.isArray(labRequest.results) ? labRequest.results[0] : labRequest.results;
    let resultId = (resultsObj as any)?.id;
    
    // Si pas de résultat ID mais qu'on a des données de formulaire, sauvegarder d'abord
    const formDataToSave = savedResults || currentFormData;
    if (!resultId && formDataToSave) {
      try {
        // Transformer les données au format API
        const sections = labRequest.exams.map((exam: any) => {
          const examName = exam.name || exam.labExam?.name || 'Examen';
          const parameters = formDataToSave.examResults[exam.id] || [];
          
          return {
            title: examName,
            items: parameters.map((param: any) => ({
              numero: param.numero || '',
              value: param.value || '',
              reference: param.referenceRange || '',
            })),
          };
        });

        const resultData = {
          labRequestId: labRequest.id,
          results: { sections },
          technicianNotes: formDataToSave.labComments || formDataToSave.interpretation || undefined,
        };

        const saveResponse = await saveLabResult(resultData);
        
        if (saveResponse.success && saveResponse.data?.id) {
          resultId = saveResponse.data.id;
        } else {
          throw new Error('Impossible de sauvegarder les résultats');
        }
      } catch (error: any) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast.error('Erreur', {
          description: error?.message || 'Impossible de sauvegarder les résultats',
        });
        return;
      }
    }

    if (!resultId && !formDataToSave) {
      toast.error('Erreur', {
        description: 'Veuillez d\'abord remplir le formulaire avant de les envoyer au médecin',
      });
      return;
    }

    try {
      setIsSending(true);

      // Étape 1: Récupérer le résultat actuel pour vérifier son statut
      const resultResponse = await getLabResultById(resultId);
      if (!resultResponse || !resultResponse.success || !resultResponse.data) {
        throw new Error(resultResponse?.error || 'Impossible de récupérer les résultats');
      }

      let currentResult = resultResponse.data;
      let currentStatus = currentResult.status;

      console.log('📋 Statut actuel du résultat:', currentStatus);

      // Étape 2: Si le résultat est en draft, le valider d'abord
      if (currentStatus === 'draft') {
        console.log('✅ Validation du résultat en cours...');
        const validateResponse = await validateLabResult(resultId);
        if (!validateResponse || !validateResponse.success) {
          throw new Error(validateResponse?.error || validateResponse?.message || 'Impossible de valider les résultats');
        }
        
        toast.success('Résultats validés', {
          description: validateResponse.message || 'Les résultats ont été validés avec succès',
        });

        // Récupérer le résultat mis à jour après validation
        const updatedResultResponse = await getLabResultById(resultId);
        if (updatedResultResponse && updatedResultResponse.success && updatedResultResponse.data) {
          currentResult = updatedResultResponse.data;
          currentStatus = currentResult.status;
          console.log('✅ Statut après validation:', currentStatus);
        }
      }

      // Étape 3: Envoyer au médecin si le statut est validated
      if (currentStatus === 'validated') {
        console.log('📤 Envoi au médecin en cours...');
        const sendResponse = await sendLabResult(resultId);
        if (!sendResponse || !sendResponse.success) {
          throw new Error(sendResponse?.error || sendResponse?.message || 'Impossible d\'envoyer les résultats au médecin');
        }

        toast.success('Succès', {
          description: sendResponse.message || 'Résultats envoyés au médecin avec succès',
        });
      } else if (currentStatus === 'sent') {
        toast.info('Information', {
          description: 'Les résultats ont déjà été envoyés au médecin',
        });
      } else {
        throw new Error(`Statut invalide: ${currentStatus}. Les résultats doivent être en statut 'draft' ou 'validated' pour être envoyés.`);
      }

      // Recharger la demande pour avoir le statut à jour
      const reloadResponse = await getLabRequestById(id);
      if (reloadResponse.success && reloadResponse.data) {
        setLabRequest(reloadResponse.data);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi au médecin:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible d\'envoyer les résultats au médecin',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handlePrint = async () => {
    if (!id) return;
    try {
      setIsPrinting(true);
      const blob = await getLabRequestPDF(id);
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        let printed = false;
        const doPrint = () => {
          if (printed) return;
          printed = true;
          printWindow.print();
          window.URL.revokeObjectURL(url);
          setIsPrinting(false);
        };
        printWindow.addEventListener('load', () => setTimeout(doPrint, 500));
        setTimeout(() => {
          doPrint();
          setIsPrinting(false);
        }, 2000);
      } else {
        window.URL.revokeObjectURL(url);
        toast.error('Veuillez autoriser les pop-ups pour imprimer le PDF');
        setIsPrinting(false);
      }
    } catch (err: any) {
      toast.error('Erreur', {
        description: err?.message || 'Impossible de générer le PDF',
      });
      setIsPrinting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;
    try {
      setIsDownloading(true);
      const blob = await getLabRequestPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const patientName = patient ? `${patient.firstName}-${patient.lastName}` : 'patient';
      a.download = `resultat-lab-${patientName}-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('PDF téléchargé');
    } catch (err: any) {
      toast.error('Erreur', {
        description: err?.message || 'Impossible de générer le PDF. Les résultats doivent être validés.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const canDownloadPDF = labRequest?.status === 'sent_to_doctor' || savedResults != null;

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-start gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/lab/requests')}
          className="gap-2 mt-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div className="flex-1">
          <PageHeader
            title={`Demande Labo - ${labRequest.id}`}
            description="Détail de la demande de laboratoire"
          />
        </div>
        {canDownloadPDF && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="gap-2"
            >
              {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              {isDownloading ? 'Téléchargement...' : 'Télécharger PDF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={isPrinting}
              className="gap-2"
            >
              {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
              {isPrinting ? 'Préparation...' : 'Imprimer'}
            </Button>
          </>
        )}
      </div>

      {/* Patient Identification Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Identification du patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Nom du patient</Label>
              <p className="font-semibold text-lg">
                {patient.firstName || ''} {patient.lastName || ''}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Âge</Label>
              <p className="font-medium">
                {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} ans` : patient.age ? `${patient.age} ans` : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">ID Patient Vitalis</Label>
              <Badge variant="outline" className="font-mono mt-1">
                {patient.vitalisId || 'N/A'}
              </Badge>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">N° Labo</Label>
              <Badge variant="outline" className="font-mono mt-1">
                {labRequest.id}
              </Badge>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Date de service</Label>
              <p className="font-medium flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                {new Date(labRequest.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Demandé par</Label>
              <p className="font-medium flex items-center gap-2 mt-1">
                <Stethoscope className="h-4 w-4" />
                {doctor?.name || 'N/A'}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rapport préparé par :</span>
              <span className="font-semibold text-foreground">Laboratoire Vitalis</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exams" className="gap-2">
            <ListChecks className="h-4 w-4" />
            <span className="hidden sm:inline">Examens demandés</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">Saisie résultats</span>
          </TabsTrigger>
        </TabsList>

        {/* Exams Tab - Display requested exams */}
        <TabsContent value="exams" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                Examens demandés par le médecin
              </CardTitle>
            </CardHeader>
            <CardContent>
              {labRequest.exams && labRequest.exams.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {labRequest.exams.map((exam: any, index: number) => {
                      const examName = exam.name || exam.labExam?.name || 'Examen';
                      const examCategory = exam.category || exam.labExam?.category || '';
                      const examPrice = exam.price || exam.labExam?.price || '0';
                      const examId = exam.id || exam.labExamId || index;
                      
                      return (
                        <Card key={examId} className="border-2 border-primary/20">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary">
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-lg">{examName}</p>
                                  {examCategory && (
                                    <p className="text-sm text-muted-foreground">{examCategory}</p>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className="font-medium">
                                {parseFloat(examPrice).toLocaleString('fr-FR')} GNF
                              </Badge>
                            </div>
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-muted-foreground">
                                Examen demandé par le médecin pour cette consultation
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total des examens</p>
                        <p className="text-2xl font-bold text-primary">
                          {labRequest.exams.length} examen{labRequest.exams.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Montant total</p>
                        <p className="text-2xl font-bold text-primary">
                          {labRequest.totalAmount 
                            ? parseFloat(labRequest.totalAmount).toLocaleString('fr-FR')
                            : '0'} GNF
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      onClick={() => setActiveTab('results')}
                      className="w-full md:w-auto"
                      size="lg"
                    >
                      <FlaskConical className="h-4 w-4 mr-2" />
                      Commencer la saisie des résultats
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aucun examen demandé pour cette consultation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab - Now includes both edit and preview modes */}
        <TabsContent value="results" className="mt-6">
          <LabResultsFormComplete
            labRequest={labRequest}
            patient={patient}
            doctor={doctor}
            onFormDataChange={(data) => {
              setCurrentFormData(data);
            }}
            onSave={async (data) => {
              try {
                // Transformer les données au format API attendu
                // Format: { sections: [{ title: "...", items: [...] }] }
                const sections = labRequest.exams.map((exam: any) => {
                  const examName = exam.name || exam.labExam?.name || 'Examen';
                  const parameters = data.examResults[exam.id] || [];
                  
                  return {
                    title: examName,
                    items: parameters.map((param: any) => ({
                      numero: param.numero || '',
                      name: param.parameterName || '',
                      value: param.value || '',
                      unit: param.unit || '',
                      reference: param.referenceRange || '',
                      status: param.alert === 'normal' ? 'normal' : 
                              param.alert === 'high' ? 'high' : 
                              param.alert === 'low' ? 'low' : null,
                    })),
                  };
                });

                // Sauvegarder les résultats au backend
                const resultData = {
                  labRequestId: labRequest.id,
                  results: { sections },
                  technicianNotes: data.labComments || data.interpretation || undefined,
                };

                const response = await saveLabResult(resultData);
                
                if (response.success) {
                  setSavedResults(data);
                  
                  toast.success('Succès', {
                    description: 'Résultats enregistrés avec succès',
                  });

                  // Recharger la demande pour avoir les résultats à jour
                  const reloadResponse = await getLabRequestById(id!);
                  if (reloadResponse.success && reloadResponse.data) {
                    setLabRequest(reloadResponse.data);
                  }
                } else {
                  throw new Error(response.message || 'Erreur lors de la sauvegarde');
                }
              } catch (error: any) {
                console.error('Erreur lors de la sauvegarde:', error);
                toast.error('Erreur', {
                  description: error?.message || 'Impossible d\'enregistrer les résultats',
                });
              }
            }}
          />
        </TabsContent>

        {/* Preview Tab - Removed, now integrated in form */}
        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Le mode Aperçu est maintenant intégré dans l'onglet "Saisie résultats"</p>
              <p className="text-sm mt-2">Utilisez le switch Édition/Aperçu pour basculer entre les modes</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSendToDoctorClick}
              className="gap-2"
              disabled={
                labRequest.status === 'sent_to_doctor' || 
                (labRequest.results && (Array.isArray(labRequest.results) 
                  ? (labRequest.results[0] as any)?.status === 'sent'
                  : (labRequest.results as any)?.status === 'sent')) ||
                isSending ||
                (!labRequest.results && !currentFormData && !savedResults)
              }
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Envoi en cours...' : 'Envoyer au médecin'}
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={isPrinting}
              className="gap-2"
            >
              {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
              {isPrinting ? 'Préparation...' : 'Imprimer résultat'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'envoi au médecin</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir envoyer ces résultats au médecin ? 
              Cette action validera et enverra définitivement les résultats. 
              Vous ne pourrez plus les modifier après l'envoi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendToDoctor}>
              Confirmer l'envoi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LabRequestDetailPage;
