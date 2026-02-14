import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  FileText,
  TestTube2,
  Pill,
  Save,
  Printer,
  Send,
  ArrowLeft,
  CheckCircle2,
  Archive,
  Scan,
  Plus,
  X,
  MoreHorizontal,
  Clock,
} from 'lucide-react';
import type { ConsultationDossier } from '@/types';
import { getPatientById } from '@/services/api/patientsService';
import { getDoctorDossierById, getDoctorDossiers, saveDoctorConsultation } from '@/services/api/doctorService';
import { getConsultationById, updateConsultation, completeConsultation, archiveDossier } from '@/services/api/consultationsService';
import { getLabExams } from '@/services/api/testsService';
import { getImagingExams } from '@/services/api/testsService';
import { createLabRequest, getLabRequests } from '@/services/api/labService';
import { createImagingRequest, getImagingRequests } from '@/services/api/imagingService';
import { createDoctorPrescription, createDoctorCustomItem } from '@/services/api/doctorService';
import { useAuth } from '@/contexts/AuthContext';

const ConsultationPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientId = searchParams.get('patient');
  const dossierId = searchParams.get('dossier');
  
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [currentDossier, setCurrentDossier] = useState<ConsultationDossier | null>(null);
  const [consultation, setConsultation] = useState<any>(null);
  const [labExamsCatalog, setLabExamsCatalog] = useState<any[]>([]);
  const [imagingExamsCatalog, setImagingExamsCatalog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [labRequestsHistory, setLabRequestsHistory] = useState<any[]>([]);
  const [imagingRequestsHistory, setImagingRequestsHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLabHistoryDialogOpen, setIsLabHistoryDialogOpen] = useState(false);
  const [isImagingHistoryDialogOpen, setIsImagingHistoryDialogOpen] = useState(false);

  // Load patient
  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) return;
      try {
        const response = await getPatientById(patientId);
        if (response.success && response.data) {
          setSelectedPatient(response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du patient:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les informations du patient',
        });
      }
    };
    loadPatient();
  }, [patientId]);

  // Load dossier
  useEffect(() => {
    const loadDossier = async () => {
      if (!patientId) return;
      
      try {
        // If dossierId is provided, use it directly
        if (dossierId) {
          const response = await getDoctorDossierById(dossierId);
          if (response.success && response.data) {
            setCurrentDossier(response.data);
            // Load consultation if exists (can be directly in response or via consultationId)
            if (response.data.consultation) {
              // Consultation is already included in the dossier response
              console.log('Consultation trouvée directement dans le dossier:', response.data.consultation);
              setConsultation(response.data.consultation);
            } else if (response.data.consultationId) {
              // Fallback: load consultation separately if only ID is provided
              console.log('Consultation ID trouvé dans le dossier:', response.data.consultationId);
              try {
                const consultResponse = await getConsultationById(response.data.consultationId);
                console.log('Réponse getConsultationById:', consultResponse);
                if (consultResponse.success && consultResponse.data) {
                  const consultationData = consultResponse.data;
                  console.log('Consultation chargée depuis dossier:', {
                    id: consultationData.id,
                    symptoms: consultationData.symptoms,
                    diagnosis: consultationData.diagnosis,
                    notes: consultationData.notes,
                  });
                  setConsultation(consultationData);
                } else {
                  console.warn('Impossible de charger la consultation:', consultResponse);
                  setConsultation(null);
                }
              } catch (error) {
                console.error('Erreur lors du chargement de la consultation:', error);
                setConsultation(null);
              }
            } else {
              // No consultation yet, reset to null
              console.log('Aucune consultation dans le dossier');
              setConsultation(null);
            }
          }
        } else {
          // If no dossierId, try to find active dossier for this patient
          const dossiersResponse = await getDoctorDossiers({
            status: 'active',
            limit: 100, // Increase limit to find the right dossier
          });
          
          if (dossiersResponse.success && dossiersResponse.data) {
            const dossiers = Array.isArray(dossiersResponse.data.dossiers) 
              ? dossiersResponse.data.dossiers 
              : dossiersResponse.data.dossiers || dossiersResponse.data || [];
            
            // Find dossier for this patient
            const patientDossier = dossiers.find((d: any) => 
              d.patient?.id === patientId || d.patientId === patientId
            );
            
            if (patientDossier) {
              setCurrentDossier(patientDossier);
              // Load consultation if exists (can be directly in response or via consultationId)
              if (patientDossier.consultation) {
                // Consultation is already included in the dossier response
                console.log('Consultation trouvée directement dans le dossier actif:', patientDossier.consultation);
                setConsultation(patientDossier.consultation);
              } else if (patientDossier.consultationId) {
                // Fallback: load consultation separately if only ID is provided
                console.log('Consultation ID trouvé dans le dossier actif:', patientDossier.consultationId);
                try {
                  const consultResponse = await getConsultationById(patientDossier.consultationId);
                  console.log('Réponse getConsultationById (dossier actif):', consultResponse);
                  if (consultResponse.success && consultResponse.data) {
                    const consultationData = consultResponse.data;
                    console.log('Consultation chargée depuis dossier actif:', {
                      id: consultationData.id,
                      symptoms: consultationData.symptoms,
                      diagnosis: consultationData.diagnosis,
                      notes: consultationData.notes,
                    });
                    setConsultation(consultationData);
                  } else {
                    console.warn('Impossible de charger la consultation (dossier actif):', consultResponse);
                    setConsultation(null);
                  }
                } catch (error) {
                  console.error('Erreur lors du chargement de la consultation (dossier actif):', error);
                  setConsultation(null);
                }
              } else {
                // No consultation yet, reset to null
                console.log('Aucune consultation dans le dossier actif');
                setConsultation(null);
              }
            } else {
              // No dossier found, reset
              setCurrentDossier(null);
              setConsultation(null);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du dossier:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger le dossier de consultation',
        });
      }
    };
    loadDossier();
  }, [dossierId, patientId]);

  // Load lab and imaging exams
  useEffect(() => {
    const loadExams = async () => {
      try {
        const [labResponse, imagingResponse] = await Promise.all([
          getLabExams({ limit: 1000 }),
          getImagingExams({ limit: 1000 }),
        ]);
        
        if (labResponse.success && labResponse.data) {
          const exams = Array.isArray(labResponse.data) 
            ? labResponse.data 
            : labResponse.data.exams || [];
          setLabExamsCatalog(exams);
        }
        
        if (imagingResponse.success && imagingResponse.data) {
          const exams = Array.isArray(imagingResponse.data) 
            ? imagingResponse.data 
            : imagingResponse.data.exams || [];
          setImagingExamsCatalog(exams);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des examens:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadExams();
  }, []);

  // Load lab and imaging requests history for this patient
  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedPatient?.id) return;
      
      try {
        setIsLoadingHistory(true);
        const [labResponse, imagingResponse] = await Promise.all([
          getLabRequests({
            patientId: selectedPatient.id,
            limit: 50, // Get last 50 requests
          }),
          getImagingRequests({
            patientId: selectedPatient.id,
            limit: 50, // Get last 50 requests
          }),
        ]);
        
        if (labResponse.success && labResponse.data) {
          const requests = Array.isArray(labResponse.data.requests) 
            ? labResponse.data.requests 
            : labResponse.data.requests || labResponse.data || [];
          setLabRequestsHistory(requests);
        }
        
        if (imagingResponse.success && imagingResponse.data) {
          const requests = Array.isArray(imagingResponse.data.requests) 
            ? imagingResponse.data.requests 
            : imagingResponse.data.requests || imagingResponse.data || [];
          setImagingRequestsHistory(requests);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadHistory();
  }, [selectedPatient?.id]);

  const [activeTab, setActiveTab] = useState('consultation');

  // Consultation form
  const [consultForm, setConsultForm] = useState({
    symptoms: '',
    diagnosis: '',
    notes: '',
  });

  // Update form when consultation loads
  useEffect(() => {
    console.log('useEffect consultation triggered, consultation:', consultation);
    if (consultation && consultation.id) {
      console.log('Chargement des données de consultation dans le formulaire:', {
        symptoms: consultation.symptoms,
        diagnosis: consultation.diagnosis,
        notes: consultation.notes,
      });
      setConsultForm({
        symptoms: consultation.symptoms || '',
        diagnosis: consultation.diagnosis || '',
        notes: consultation.notes || '',
      });
    } else {
      // Only reset if consultation is explicitly null (not just loading)
      if (consultation === null) {
        console.log('Aucune consultation trouvée, réinitialisation du formulaire');
        setConsultForm({
          symptoms: '',
          diagnosis: '',
          notes: '',
        });
      }
    }
  }, [consultation]);

  // Load custom items from dossier
  useEffect(() => {
    if (currentDossier?.customItems && Array.isArray(currentDossier.customItems) && currentDossier.customItems.length > 0) {
      console.log('Chargement des items personnalisés depuis le dossier:', currentDossier.customItems);
      setOtherItems(
        currentDossier.customItems.map((item: any) => ({
          id: item.id,
          name: item.name || '',
          description: item.description || '',
        }))
      );
    } else if (currentDossier && (!currentDossier.customItems || currentDossier.customItems.length === 0)) {
      // Dossier chargé mais pas d'items, initialiser avec un item vide
      console.log('Aucun item personnalisé dans le dossier, initialisation avec un item vide');
      setOtherItems([{ name: '', description: '' }]);
    }
  }, [currentDossier?.customItems]);

  // Load prescriptions from dossier
  useEffect(() => {
    if (currentDossier?.prescriptions && Array.isArray(currentDossier.prescriptions) && currentDossier.prescriptions.length > 0) {
      console.log('Chargement des prescriptions depuis le dossier:', currentDossier.prescriptions);
      // Prendre tous les items de toutes les prescriptions
      const allItems: any[] = [];
      currentDossier.prescriptions.forEach((prescription: any) => {
        if (prescription.items && Array.isArray(prescription.items)) {
          prescription.items.forEach((item: any) => {
            allItems.push({
              id: item.id,
              medication: item.medication || item.medicationName || '',
              dosage: item.dosage || '',
              frequency: item.frequency || '',
              duration: item.duration || '',
              quantity: item.quantity?.toString() || '',
              instructions: item.instructions || '',
            });
          });
        }
      });
      
      // Toujours garder les items existants, même s'il n'y en a pas
      // Ne pas réinitialiser si on a déjà des items (pour ne pas perdre les nouveaux items en cours de saisie)
      if (allItems.length > 0) {
        // Garder les nouveaux items (sans id) et ajouter les items existants
        const existingItemsWithId = allItems.filter(item => item.id);
        const newItemsWithoutId = prescriptionItems.filter(item => !item.id);
        setPrescriptionItems([...existingItemsWithId, ...newItemsWithoutId]);
      }
    } else if (currentDossier && (!currentDossier.prescriptions || currentDossier.prescriptions.length === 0)) {
      // Pas de prescriptions, garder seulement les nouveaux items en cours de saisie
      const newItems = prescriptionItems.filter(item => !item.id);
      if (newItems.length === 0) {
        // Si pas de nouveaux items non plus, ne rien faire (garder l'état actuel)
      }
    }
  }, [currentDossier?.prescriptions]);

  // Lab request
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  // Imaging request
  const [selectedImagingExams, setSelectedImagingExams] = useState<string[]>([]);

  // Prescription
  const [prescriptionItems, setPrescriptionItems] = useState<Array<{
    id?: string;
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: string;
    instructions: string;
  }>>([]);

  // Other items (custom items)
  const [otherItems, setOtherItems] = useState<Array<{ id?: string; name: string; description: string }>>([
    { name: '', description: '' },
  ]);

  // Archive dialog state
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  // Format price function (with dots as thousand separators)
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '0,00 GNF';
    // Format: convert to string, add thousand separators with dots
    const parts = numPrice.toFixed(2).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    // Add dots every 3 digits from right to left
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInteger},${decimalPart} GNF`;
  };

  const handleSaveConsultation = async () => {
    if (!selectedPatient || !selectedPatient.id) {
      toast.error('Données manquantes', {
        description: 'Patient introuvable',
      });
      return;
    }
    
    try {
      const consultationData: any = {
        patientId: selectedPatient.id,
        symptoms: consultForm.symptoms || undefined,
        diagnosis: consultForm.diagnosis || undefined,
        notes: consultForm.notes || undefined,
      };
      
      // Add dossierId if available
      if (currentDossier?.id) {
        consultationData.dossierId = currentDossier.id;
      }
      
      console.log('Saving consultation with data:', consultationData);
      
      const response = await saveDoctorConsultation(consultationData);
      
      console.log('Save consultation response:', response);
      
      if (response.success) {
        toast.success('Consultation enregistrée');
        // Reload dossier and consultation
        if (currentDossier?.id) {
          const dossierResponse = await getDoctorDossierById(currentDossier.id);
          if (dossierResponse.success && dossierResponse.data) {
            setCurrentDossier(dossierResponse.data);
            if (dossierResponse.data.consultationId) {
              const consultResponse = await getConsultationById(dossierResponse.data.consultationId);
              if (consultResponse.success && consultResponse.data) {
                console.log('Consultation rechargée après sauvegarde:', consultResponse.data);
                setConsultation(consultResponse.data);
              }
            }
          }
        } else if (response.data?.dossierId) {
          // If dossier was created, load it
          const dossierResponse = await getDoctorDossierById(response.data.dossierId);
          if (dossierResponse.success && dossierResponse.data) {
            setCurrentDossier(dossierResponse.data);
            if (dossierResponse.data.consultationId) {
              const consultResponse = await getConsultationById(dossierResponse.data.consultationId);
              if (consultResponse.success && consultResponse.data) {
                console.log('Consultation chargée depuis nouveau dossier:', consultResponse.data);
                setConsultation(consultResponse.data);
              }
            }
          }
        } else if (response.data?.consultationId) {
          // If consultation ID is directly in response
          const consultResponse = await getConsultationById(response.data.consultationId);
          if (consultResponse.success && consultResponse.data) {
            console.log('Consultation chargée depuis réponse:', consultResponse.data);
            setConsultation(consultResponse.data);
          }
        }
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible d\'enregistrer la consultation',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible d\'enregistrer la consultation',
      });
    }
  };

  // Terminer la consultation (passe le dossier à "completed")
  const handleCompleteConsultation = async () => {
    if (!currentDossier) {
      toast.error('Aucun dossier actif trouvé');
      return;
    }
    
    // If consultation doesn't exist, create it first
    if (!consultation || !consultation.id) {
      if (!selectedPatient || !selectedPatient.id) {
        toast.error('Erreur', {
          description: 'Patient introuvable',
        });
        return;
      }
      
      // Try to save consultation first
      try {
        const consultationData: any = {
          patientId: selectedPatient.id,
          symptoms: consultForm.symptoms || undefined,
          diagnosis: consultForm.diagnosis || undefined,
          notes: consultForm.notes || undefined,
        };
        
        if (currentDossier?.id) {
          consultationData.dossierId = currentDossier.id;
        }
        
        const saveResponse = await saveDoctorConsultation(consultationData);
        
        if (saveResponse.success) {
          // Reload dossier to get consultation ID
          if (currentDossier?.id) {
            const dossierResponse = await getDoctorDossierById(currentDossier.id);
            if (dossierResponse.success && dossierResponse.data) {
              setCurrentDossier(dossierResponse.data);
              if (dossierResponse.data.consultationId) {
                const consultResponse = await getConsultationById(dossierResponse.data.consultationId);
                if (consultResponse.success && consultResponse.data) { 
                  setConsultation(consultResponse.data); 
                  // Now complete it
                  await completeConsultation(consultResponse.data.id);
                  toast.success('Consultation terminée', {
                    description: 'Le dossier est prêt à être archivé',  
                  });
                  return; 
                }
              }
            }
          } else if (saveResponse.data?.consultationId) { 
            // If consultation was created, get it and complete it
            const consultResponse = await getConsultationById(saveResponse.data.consultationId);
            if (consultResponse.success && consultResponse.data) {
              setConsultation(consultResponse.data);
              await completeConsultation(consultResponse.data.id);
              toast.success('Consultation terminée', {
                description: 'Le dossier est prêt à être archivé', 
              });
              return;
            }
          }
        }
      } catch (error: any) {
        console.error('Erreur lors de la création de la consultation:', error);
        toast.error('Erreur', {
          description: 'Impossible de créer la consultation',
        });
        return;
      }
    }
    
    try {
      console.log('Completing consultation:', consultation.id);
      const response = await completeConsultation(consultation.id);
      console.log('Complete consultation response:', response);
      
      if (response.success) {
        toast.success('Consultation terminée', {
          description: 'Le dossier est prêt à être archivé',
        });
        // Reload dossier to update status
        if (currentDossier.id) {
          const dossierResponse = await getDoctorDossierById(currentDossier.id);
          if (dossierResponse.success && dossierResponse.data) {
            setCurrentDossier(dossierResponse.data);
          }
        }
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de terminer la consultation',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la finalisation:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de terminer la consultation',
      });
    }
  };

  // Open archive confirmation dialog
  const handleOpenArchiveDialog = () => {
    if (!currentDossier) {
      toast.error('Aucun dossier actif trouvé');
      return;
    }
    setIsArchiveDialogOpen(true);
  };

  // Archiver le dossier (confirmed)
  const handleArchiveDossier = async () => {
    if (!currentDossier) {
      toast.error('Aucun dossier actif trouvé');
      return;
    }
    
    try {
      const response = await archiveDossier(currentDossier.id);
      if (response.success) {
        toast.success('Dossier archivé', {
          description: 'Le dossier a été archivé avec succès',
        });
        setIsArchiveDialogOpen(false);
        setTimeout(() => {
          navigate('/doctor/patients');
        }, 1500);
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible d\'archiver le dossier',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'archivage:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible d\'archiver le dossier',
      });
    }
  };

  const handleLabRequest = async () => {
    if (selectedExams.length === 0) {
      toast.error('Sélectionnez au moins un examen');
      return;
    }
    
    if (!selectedPatient || !currentDossier) {
      toast.error('Données manquantes');
      return;
    }
    
    try {
      const response = await createLabRequest({
        patientId: selectedPatient.id,
        doctorId: user?.id || '',
        consultationId: consultation?.id || currentDossier?.consultationId,
        examIds: selectedExams,
      });
      
      if (response.success) {
        toast.success('Demande d\'examens envoyée à l\'accueil', {
          description: `${selectedExams.length} examen(s) demandé(s)`,
        });
        setSelectedExams([]);
        // Reload history
        if (selectedPatient?.id) {
          try {
            const historyResponse = await getLabRequests({
              patientId: selectedPatient.id,
              limit: 50,
            });
            if (historyResponse.success && historyResponse.data) {
              const requests = Array.isArray(historyResponse.data.requests) 
                ? historyResponse.data.requests 
                : historyResponse.data.requests || historyResponse.data || [];
              setLabRequestsHistory(requests);
            }
          } catch (error) {
            console.error('Erreur lors du rechargement de l\'historique:', error);
          }
        }
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de créer la demande',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de la demande:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de créer la demande',
      });
    }
  };

  const handleImagingRequest = async () => {
    if (selectedImagingExams.length === 0) {
      toast.error('Sélectionnez au moins un examen d\'imagerie');
      return;
    }
    
    if (!selectedPatient || !currentDossier) {
      toast.error('Données manquantes');
      return;
    }
    
    try {
      const response = await createImagingRequest({
        patientId: selectedPatient.id,
        doctorId: user?.id || '',
        consultationId: consultation?.id || currentDossier?.consultationId,
        examIds: selectedImagingExams,
      });
      
      if (response.success) {
        toast.success('Demande d\'examens d\'imagerie envoyée à l\'accueil', {
          description: `${selectedImagingExams.length} examen(s) demandé(s)`,
        });
        setSelectedImagingExams([]);
        // Reload history
        if (selectedPatient?.id) {
          try {
            const historyResponse = await getImagingRequests({
              patientId: selectedPatient.id,
              limit: 50,
            });
            if (historyResponse.success && historyResponse.data) {
              const requests = Array.isArray(historyResponse.data.requests) 
                ? historyResponse.data.requests 
                : historyResponse.data.requests || historyResponse.data || [];
              setImagingRequestsHistory(requests);
            }
          } catch (error) {
            console.error('Erreur lors du rechargement de l\'historique:', error);
          }
        }
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de créer la demande',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de la demande:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de créer la demande',
      });
    }
  };

  const handleAddPrescriptionItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medication: '', dosage: '', frequency: '', duration: '', quantity: '', instructions: '' },
    ]);
  };

  const handleSavePrescription = async () => {
    if (!selectedPatient || !consultation || !user) {
      toast.error('Données manquantes');
      return;
    }
    
    // Séparer les items existants (avec id) et les nouveaux (sans id)
    const existingItems = prescriptionItems.filter((item) => item.id);
    const newItems = prescriptionItems.filter(
      (item) => !item.id && item.medication && item.dosage && item.frequency && item.duration
    );
    
    if (newItems.length === 0 && existingItems.length === 0) {
      toast.error('Veuillez remplir au moins un médicament');
      return;
    }
    
    try {
      // Si on a de nouveaux items, les créer
      if (newItems.length > 0) {
        const response = await createDoctorPrescription({
          consultationId: consultation.id,
          patientId: selectedPatient.id,
          items: newItems.map((item) => ({
            medication: item.medication,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity || '',
            instructions: item.instructions || undefined,
          })),
        });
        
        if (response.success) {
          toast.success('Nouveaux médicaments ajoutés à l\'ordonnance');
          // Recharger le dossier pour avoir les nouveaux items avec leurs IDs
          if (currentDossier?.id) {
            const dossierResponse = await getDoctorDossierById(currentDossier.id);
            if (dossierResponse.success && dossierResponse.data) {
              setCurrentDossier(dossierResponse.data);
              // Les nouveaux items seront automatiquement chargés via le useEffect
              // On vide juste les nouveaux items du formulaire
              const existingItems = prescriptionItems.filter((item) => item.id);
              setPrescriptionItems(existingItems);
            }
          }
        } else {
          toast.error('Erreur', {
            description: response.message || 'Impossible d\'enregistrer l\'ordonnance',
          });
          return;
        }
      } else {
        toast.success('Ordonnance à jour');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible d\'enregistrer l\'ordonnance',
      });
    }
  };

  const handleSaveOther = async () => {
    if (!selectedPatient || !user) {
      toast.error('Données manquantes');
      return;
    }
    
    // Filter out empty items
    const validItems = otherItems.filter((item) => item.name);
    
    if (validItems.length === 0) {
      toast.error('Veuillez remplir au moins un item');
      return;
    }
    
    try {
      const promises = validItems.map((item) =>
        createDoctorCustomItem({
          consultationId: consultation?.id,
          patientId: selectedPatient.id,
          doctorId: user.id,
          name: item.name,
          description: item.description || undefined,
        })
      );
      
      await Promise.all(promises);
      toast.success('Items enregistrés');
      // Reset form
      setOtherItems([{ name: '', description: '' }]);
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible d\'enregistrer les items',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/doctor/patients')}
          className="gap-2 mt-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Button>
        <div className="flex-1">
          <PageHeader
            title="Consultation"
            description="Fiche de consultation patient"
          />
        </div>
      </div>

      {/* Patient info header */}
      {isLoading ? (
        <Card className="border-2 border-primary/20">
          <CardContent className="py-4">
            <div className="text-center text-muted-foreground">
              <p>Chargement des informations du patient...</p>
            </div>
          </CardContent>
        </Card>
      ) : !selectedPatient ? (
        <Card className="border-2 border-destructive/20">
          <CardContent className="py-4">
            <div className="text-center text-destructive">
              <p className="font-medium mb-2">Patient introuvable</p>
              <p className="text-sm text-muted-foreground">
                Impossible de charger les informations du patient. Veuillez retourner à la liste des patients.
              </p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => navigate('/doctor/patients')}
              >
                Retour à la liste
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-primary/20">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {selectedPatient.firstName?.[0] || '?'}{selectedPatient.lastName?.[0] || '?'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedPatient.firstName || 'N/A'} {selectedPatient.lastName || ''}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="font-mono">
                      {selectedPatient.vitalisId || 'N/A'}
                    </Badge>
                    <span>•</span>
                    <span>{(selectedPatient.gender === 'M' || selectedPatient.gender === 'male') ? 'Homme' : (selectedPatient.gender === 'F' || selectedPatient.gender === 'female') ? 'Femme' : 'Non renseigné'}</span>
                    <span>•</span>
                    <span>
                      {selectedPatient.dateOfBirth && !isNaN(new Date(selectedPatient.dateOfBirth).getTime())
                        ? `${Math.floor((new Date().getTime() - new Date(selectedPatient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} ans`
                        : (selectedPatient as any).age 
                          ? `${(selectedPatient as any).age} ans`
                          : 'Âge non renseigné'}
                    </span>
                    {selectedPatient.phone && (
                      <>
                        <span>•</span>
                        <span>{selectedPatient.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" className="gap-2" onClick={handleOpenArchiveDialog}>
                  <Archive className="h-4 w-4" />
                  Archiver le dossier
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consultation tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="consultation" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Consultation</span>
          </TabsTrigger>
          <TabsTrigger value="lab" className="gap-2">
            <TestTube2 className="h-4 w-4" />
            <span className="hidden sm:inline">Labo</span>
          </TabsTrigger>
          <TabsTrigger value="imaging" className="gap-2">
            <Scan className="h-4 w-4" />
            <span className="hidden sm:inline">Imagerie</span>
          </TabsTrigger>
          <TabsTrigger value="other" className="gap-2">
            <MoreHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Autre</span>
          </TabsTrigger>
          <TabsTrigger value="prescription" className="gap-2">
            <Pill className="h-4 w-4" />
            <span className="hidden sm:inline">Ordonnance</span>
          </TabsTrigger>
        </TabsList>

        {/* Consultation Tab */}
        <TabsContent value="consultation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Fiche de consultation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Symptômes / Motif de consultation</Label>
                <Textarea
                  placeholder="Décrivez les symptômes du patient..."
                  rows={3}
                  value={consultForm.symptoms}
                  onChange={(e) => setConsultForm({ ...consultForm, symptoms: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Diagnostic</Label>
                <Textarea
                  placeholder="Diagnostic établi..."
                  rows={3}
                  value={consultForm.diagnosis}
                  onChange={(e) => setConsultForm({ ...consultForm, diagnosis: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes / Observations</Label>
                <Textarea
                  placeholder="Notes complémentaires..."
                  rows={3}
                  value={consultForm.notes}
                  onChange={(e) => setConsultForm({ ...consultForm, notes: e.target.value })}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="gap-2" onClick={handleSaveConsultation}>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
                <Button className="gap-2" onClick={handleCompleteConsultation}>
                  <CheckCircle2 className="h-4 w-4" />
                  Terminer la consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Tab */}
        <TabsContent value="lab" className="mt-6 space-y-6">
          {/* New request form */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TestTube2 className="h-5 w-5 text-warning" />
                  Demande d'examens de laboratoire
                </CardTitle>
                <Dialog open={isLabHistoryDialogOpen} onOpenChange={setIsLabHistoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Clock className="h-4 w-4" />
                      Voir l'historique
                      {labRequestsHistory.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {labRequestsHistory.length}
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        Historique des demandes de laboratoire
                      </DialogTitle>
                      <DialogDescription>
                        Liste de toutes les demandes de laboratoire pour ce patient
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-3">
                      {isLoadingHistory ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Chargement de l'historique...
                        </div>
                      ) : labRequestsHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Aucune demande de laboratoire trouvée pour ce patient
                        </div>
                      ) : (
                        labRequestsHistory.map((request: any) => (
                          <Card key={request.id} className="border">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono text-xs">
                                      {request.id?.slice(0, 8) || 'N/A'}
                                    </Badge>
                                    <StatusBadge 
                                      status={
                                        request.status === 'completed' ? 'completed' :
                                        request.status === 'in_progress' ? 'in_progress' :
                                        request.status === 'pending' ? 'pending' :
                                        'pending'
                                      }
                                    />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium mb-1">
                                      Examens demandés ({request.exams?.length || 0})
                                    </p>
                                    {request.exams && request.exams.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {request.exams.map((exam: any, idx: number) => (
                                          <Badge key={idx} variant="secondary" className="text-xs">
                                            {exam.name || exam.examName || 'Examen'}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>
                                      {request.createdAt 
                                        ? new Date(request.createdAt).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })
                                        : 'Date inconnue'}
                                    </span>
                                    {request.doctor && (
                                      <span>Par: {request.doctor.name || 'Médecin'}</span>
                                    )}
                                  </div>
                                  {request.notes && (
                                    <p className="text-xs text-muted-foreground italic">
                                      Note: {request.notes}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-primary">
                                    {formatPrice(request.totalAmount || 0)}
                                  </p>
                                  {request.resultId && (
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      Résultat disponible
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {labExamsCatalog.map((exam) => (
                  <label
                    key={exam.id}
                    className={`
                      flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedExams.includes(exam.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                        checked={selectedExams.includes(exam.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExams([...selectedExams, exam.id]);
                          } else {
                            setSelectedExams(selectedExams.filter((id) => id !== exam.id));
                          }
                        }}
                      />
                      <div>
                        <p className="font-medium text-sm">{exam.name}</p>
                        <p className="text-xs text-muted-foreground">{exam.category}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {formatPrice(exam.price)}
                    </span>
                  </label>
                ))}
              </div>

              {selectedExams.length > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(
                        labExamsCatalog
                          .filter((e) => selectedExams.includes(e.id))
                          .reduce((sum, e) => {
                            const price = typeof e.price === 'string' ? parseFloat(e.price) : e.price;
                            return sum + (isNaN(price) ? 0 : price);
                          }, 0)
                      )}
                    </span>
                  </div>
                  <Button className="w-full gap-2" onClick={handleLabRequest}>
                    <Send className="h-4 w-4" />
                    Envoyer la demande (paiement à l'accueil)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Imaging Tab */}
        <TabsContent value="imaging" className="mt-6 space-y-6">
          {/* History of previous requests */}
          {imagingRequestsHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Historique des demandes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {imagingRequestsHistory.map((request: any) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            {request.id?.slice(0, 8) || 'N/A'}
                          </Badge>
                          <StatusBadge 
                            status={
                              request.status === 'completed' ? 'completed' :
                              request.status === 'in_progress' ? 'in_progress' :
                              request.status === 'pending' ? 'pending' :
                              'pending'
                            }
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.exams?.length || 0} examen(s) demandé(s)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.createdAt 
                            ? new Date(request.createdAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Date inconnue'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatPrice(request.totalAmount || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* New request form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scan className="h-5 w-5 text-primary" />
                Nouvelle demande d'examens d'imagerie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {imagingExamsCatalog.map((exam) => (
                  <label
                    key={exam.id}
                    className={`
                      flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedImagingExams.includes(exam.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                        checked={selectedImagingExams.includes(exam.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedImagingExams([...selectedImagingExams, exam.id]);
                          } else {
                            setSelectedImagingExams(selectedImagingExams.filter((id) => id !== exam.id));
                          }
                        }}
                      />
                      <div>
                        <p className="font-medium text-sm">{exam.name}</p>
                        <p className="text-xs text-muted-foreground">{exam.category}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {formatPrice(exam.price)}
                    </span>
                  </label>
                ))}
              </div>

              {selectedImagingExams.length > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(
                        imagingExamsCatalog
                          .filter((e) => selectedImagingExams.includes(e.id))
                          .reduce((sum, e) => {
                            const price = typeof e.price === 'string' ? parseFloat(e.price) : e.price;
                            return sum + (isNaN(price) ? 0 : price);
                          }, 0)
                      )}
                    </span>
                  </div>
                  <Button className="w-full gap-2" onClick={handleImagingRequest}>
                    <Send className="h-4 w-4" />
                    Envoyer la demande (paiement à l'accueil)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tab */}
        <TabsContent value="other" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MoreHorizontal className="h-5 w-5 text-primary" />
                Autres items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {otherItems.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-secondary/20">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <Label>Nom de l'item</Label>
                            <Input
                              placeholder="Ex: Certificat médical, Attestation..."
                              value={item.name}
                              onChange={(e) => {
                                const updated = [...otherItems];
                                updated[index].name = e.target.value;
                                setOtherItems(updated);
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              placeholder="Description de l'item..."
                              rows={3}
                              value={item.description}
                              onChange={(e) => {
                                const updated = [...otherItems];
                                updated[index].description = e.target.value;
                                setOtherItems(updated);
                              }}
                            />
                          </div>
                        </div>
                        {otherItems.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = otherItems.filter((_, i) => i !== index);
                              setOtherItems(updated);
                            }}
                            className="mt-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  setOtherItems([...otherItems, { name: '', description: '' }]);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un item
              </Button>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => {
                  toast.success('Items enregistrés');
                }}>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => {
                  toast.success('Impression lancée');
                }}>
                  <Printer className="h-4 w-4" />
                  Imprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescription Tab */}
        <TabsContent value="prescription" className="mt-6 space-y-6">
          {/* Existing prescription items */}
          {prescriptionItems.filter(item => item.id).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Médicaments enregistrés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {prescriptionItems
                    .filter(item => item.id)
                    .map((item) => (
                      <div key={item.id} className="p-4 rounded-lg border bg-secondary/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Médicament</Label>
                            <Input
                              placeholder="Nom du médicament"
                              value={item.medication}
                              onChange={(e) => {
                                const updated = [...prescriptionItems];
                                const itemIndex = updated.findIndex(i => i.id === item.id);
                                if (itemIndex !== -1) {
                                  updated[itemIndex].medication = e.target.value;
                                  setPrescriptionItems(updated);
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Dosage</Label>
                            <Input
                              placeholder="500mg"
                              value={item.dosage}
                              onChange={(e) => {
                                const updated = [...prescriptionItems];
                                const itemIndex = updated.findIndex(i => i.id === item.id);
                                if (itemIndex !== -1) {
                                  updated[itemIndex].dosage = e.target.value;
                                  setPrescriptionItems(updated);
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Fréquence</Label>
                            <Input
                              placeholder="3 fois/jour"
                              value={item.frequency}
                              onChange={(e) => {
                                const updated = [...prescriptionItems];
                                const itemIndex = updated.findIndex(i => i.id === item.id);
                                if (itemIndex !== -1) {
                                  updated[itemIndex].frequency = e.target.value;
                                  setPrescriptionItems(updated);
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Durée</Label>
                            <Input
                              placeholder="7 jours"
                              value={item.duration}
                              onChange={(e) => {
                                const updated = [...prescriptionItems];
                                const itemIndex = updated.findIndex(i => i.id === item.id);
                                if (itemIndex !== -1) {
                                  updated[itemIndex].duration = e.target.value;
                                  setPrescriptionItems(updated);
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Quantité</Label>
                            <Input
                              type="number"
                              placeholder="21"
                              value={item.quantity}
                              onChange={(e) => {
                                const updated = [...prescriptionItems];
                                const itemIndex = updated.findIndex(i => i.id === item.id);
                                if (itemIndex !== -1) {
                                  updated[itemIndex].quantity = e.target.value;
                                  setPrescriptionItems(updated);
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Instructions</Label>
                            <Input
                              placeholder="Après les repas"
                              value={item.instructions}
                              onChange={(e) => {
                                const updated = [...prescriptionItems];
                                const itemIndex = updated.findIndex(i => i.id === item.id);
                                if (itemIndex !== -1) {
                                  updated[itemIndex].instructions = e.target.value;
                                  setPrescriptionItems(updated);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* New prescription items form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                {prescriptionItems.filter(item => item.id).length > 0 ? 'Ajouter des médicaments' : 'Ordonnance médicale'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptionItems
                  .filter(item => !item.id)
                  .map((item, index) => {
                    const globalIndex = prescriptionItems.findIndex(i => i === item);
                    return (
                      <div key={`new-${index}`} className="p-4 rounded-lg border bg-secondary/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Médicament</Label>
                            <Input
                              placeholder="Nom du médicament"
                              value={item.medication}
                              onChange={(e) => {
                                const updated = [...prescriptionItems];
                                updated[globalIndex].medication = e.target.value;
                                setPrescriptionItems(updated);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Dosage</Label>
                            <Input
                              placeholder="500mg"
                              value={item.dosage}
                              onChange={(e) => {
                                const updated = [...prescriptionItems];
                                updated[globalIndex].dosage = e.target.value;
                                setPrescriptionItems(updated);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Fréquence</Label>
                            <Input
                              placeholder="3 fois/jour"
                              value={item.frequency}
                              onChange={(e) => {
                                const updated = [...prescriptionItems];
                                updated[globalIndex].frequency = e.target.value;
                                setPrescriptionItems(updated);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Durée</Label>
                            <Input
                              placeholder="7 jours"
                              value={item.duration}
                              onChange={(e) => {
                                const updated = [...prescriptionItems];
                                updated[globalIndex].duration = e.target.value;
                                setPrescriptionItems(updated);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Quantité</Label>
                            <Input
                              type="number"
                              placeholder="21"
                              value={item.quantity}
                              onChange={(e) => {
                                const updated = [...prescriptionItems];
                                updated[globalIndex].quantity = e.target.value;
                                setPrescriptionItems(updated);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Instructions</Label>
                            <Input
                              placeholder="Après les repas"
                              value={item.instructions}
                              onChange={(e) => {
                                const updated = [...prescriptionItems];
                                updated[globalIndex].instructions = e.target.value;
                                setPrescriptionItems(updated);
                              }}
                            />
                          </div>
                        </div>
                        {prescriptionItems.filter(item => !item.id).length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = prescriptionItems.filter((_, i) => i !== globalIndex);
                              setPrescriptionItems(updated);
                            }}
                            className="mt-3"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                        )}
                      </div>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleAddPrescriptionItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un médicament
              </Button>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button variant="outline" className="flex-1 gap-2" onClick={handleSavePrescription}>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Archive Dossier Confirmation Dialog */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver le dossier</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir archiver ce dossier ? Cette action est irréversible et le dossier ne pourra plus être modifié.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchiveDossier}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Archiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConsultationPage;
