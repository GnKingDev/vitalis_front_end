import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Stepper, Step } from '@/components/shared/Stepper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
  UserPlus,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Stethoscope,
  CheckCircle2,
  Smartphone,
  Banknote,
  User,
  Fingerprint,
  Clock,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import type { Patient, Bed } from '@/types';
import { 
  getAvailableBeds, 
  occupyBed as occupyBedApi,
  registerPatient as registerPatientApi,
  registerPatientPayment,
  createAssignment,
  getReceptionDoctors,
} from '@/services/api/receptionService';
import { getConsultationPrice } from '@/services/api/consultationPriceService';
import { getConsultationTypes, type ConsultationTypeItem } from '@/services/api/consultationTypesService';
import { getPatients } from '@/services/api/patientsService';
import { getInsuranceEstablishments } from '@/services/api/insuranceEstablishmentsService';
import type { InsuranceEstablishment } from '@/services/api/insuranceEstablishmentsService';

const steps: Step[] = [
  { id: 1, title: 'Paiement', description: 'Consultation', icon: CreditCard },
  { id: 2, title: 'ID Vitalis', description: 'Confirmation', icon: Fingerprint },
  { id: 3, title: 'Médecin', description: 'Assignation', icon: Stethoscope },
];

const RegisterPatient: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [existingPatient, setExistingPatient] = useState<Patient | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [insuranceEstablishments, setInsuranceEstablishments] = useState<InsuranceEstablishment[]>([]);
  const [isLoadingInsurance, setIsLoadingInsurance] = useState(false);
  const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false);
  const [confirmAssignmentOpen, setConfirmAssignmentOpen] = useState(false);

  // Reset step when tab changes
  useEffect(() => {
    setCurrentStep(1);
    setGeneratedId(null);
    setExistingPatient(null);
    setSearchQuery('');
    setSelectedBed('none');
    setBedTypeFilter('all');
    setInsuranceData({ isInsured: false, establishmentId: '', coveragePercent: 0, memberNumber: '' });
    setDiscountData({ hasDiscount: false, discountPercent: 0 });
  }, [activeTab]);

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    bloodType: '',
    allergies: '',
  });

  // Payment data
  const [paymentData, setPaymentData] = useState({
    method: 'cash' as 'cash' | 'orange_money',
    amount: 0,
    reference: '',
  });

  // Assurance (mock — à brancher sur le backend)
  const [insuranceData, setInsuranceData] = useState({
    isInsured: false,
    establishmentId: '',
    coveragePercent: 0,
    memberNumber: '', // numéro identifiant chez l'assureur
  });

  // Remise (mock — à brancher sur le backend)
  const [discountData, setDiscountData] = useState({
    hasDiscount: false,
    discountPercent: 0,
  });

  // Bed selection
  const [selectedBed, setSelectedBed] = useState<string>('none');
  const [bedTypeFilter, setBedTypeFilter] = useState<'all' | 'classic' | 'vip'>('all');
  const [availableBeds, setAvailableBeds] = useState<Bed[]>([]);
  const [isLoadingBeds, setIsLoadingBeds] = useState(false);
  const [consultationPrice, setConsultationPrice] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [consultationTypes, setConsultationTypes] = useState<ConsultationTypeItem[]>([]);
  const [selectedConsultationTypeIds, setSelectedConsultationTypeIds] = useState<string[]>([]);

  // Assignment data
  const [selectedDoctor, setSelectedDoctor] = useState('');

  // Load available beds, consultation price and insurance establishments (actives only)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingBeds(true);
        setIsLoadingPrice(true);
        setIsLoadingInsurance(true);

        // Load available beds
        const bedsResponse = await getAvailableBeds();
        if (bedsResponse.success && bedsResponse.data) {
          const bedsData = Array.isArray(bedsResponse.data) 
            ? bedsResponse.data 
            : bedsResponse.data.beds || [];
          setAvailableBeds(bedsData);
        }

        // Load consultation price (fallback si pas de types)
        const priceResponse = await getConsultationPrice();
        if (priceResponse.success && priceResponse.data) {
          setConsultationPrice(priceResponse.data.price || 0);
        }

        // Load consultation types (pour sélection multiple)
        const typesResponse = await getConsultationTypes({ activeOnly: true });
        if (typesResponse.success && Array.isArray(typesResponse.data)) {
          setConsultationTypes(typesResponse.data);
          if (typesResponse.data.length > 0 && selectedConsultationTypeIds.length === 0) {
            setSelectedConsultationTypeIds(typesResponse.data.map((t) => t.id));
          }
        }

        // Load insurance establishments (actives only for selector)
        const insResponse = await getInsuranceEstablishments({ isActive: true });
        if (insResponse.success && insResponse.data) {
          const list = Array.isArray(insResponse.data)
            ? insResponse.data
            : (insResponse.data as any).establishments ?? [];
          setInsuranceEstablishments(list);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les lits et le prix de consultation',
        });
      } finally {
        setIsLoadingBeds(false);
        setIsLoadingPrice(false);
        setIsLoadingInsurance(false);
      }
    };

    loadData();
  }, []);

  // Load doctors
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setIsLoadingDoctors(true);
        const response = await getReceptionDoctors();
        if (response.success && response.data) {
          const doctorsData = Array.isArray(response.data) 
            ? response.data 
            : response.data.doctors || [];
          setDoctors(doctorsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des médecins:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger la liste des médecins',
        });
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, []);

  // Filter beds by type
  const filteredBeds = useMemo(() => {
    if (bedTypeFilter === 'all') {
      return availableBeds;
    }
    return availableBeds.filter((bed) => bed.type === bedTypeFilter);
  }, [availableBeds, bedTypeFilter]);

  // Montant de base (types de consultation sélectionnés + lit VIP)
  const consultationAmount = useMemo(() => {
    if (selectedConsultationTypeIds.length > 0) {
      return selectedConsultationTypeIds.reduce((sum, id) => {
        const t = consultationTypes.find((c) => c.id === id);
        return sum + (t ? Number(t.price) || 0 : 0);
      }, 0);
    }
    return Number(consultationPrice) || 0;
  }, [selectedConsultationTypeIds, consultationTypes, consultationPrice]);

  const baseAmount = useMemo(() => {
    const bed = selectedBed && selectedBed !== 'none' 
      ? availableBeds.find((b) => b.id === selectedBed) 
      : null;
    const bedFee = bed ? (Number(bed.additionalFee) || 0) : 0;
    return consultationAmount + bedFee;
  }, [selectedBed, consultationAmount, availableBeds]);

  // Déduction assurance puis remise
  const { insuranceDeduction, discountDeduction, totalAmount } = useMemo(() => {
    const base = Number(baseAmount) || 0;
    const insDed = insuranceData.isInsured && insuranceData.coveragePercent > 0
      ? base * (insuranceData.coveragePercent / 100)
      : 0;
    const afterInsurance = base - insDed;
    const discDed = discountData.hasDiscount && discountData.discountPercent > 0
      ? afterInsurance * (discountData.discountPercent / 100)
      : 0;
    return {
      insuranceDeduction: insDed,
      discountDeduction: discDed,
      totalAmount: Math.max(0, Math.round((afterInsurance - discDed) * 100) / 100),
    };
  }, [baseAmount, insuranceData.isInsured, insuranceData.coveragePercent, discountData.hasDiscount, discountData.discountPercent]);

  // Update payment amount when total changes
  useEffect(() => {
    setPaymentData((prev) => ({ ...prev, amount: totalAmount }));
  }, [totalAmount]);

  const handleChange = (field: string, value: string) => {
    // Auto-format phone number with +224 prefix
    if (field === 'phone') {
      // Remove all non-digit characters
      let cleaned = value.replace(/\D/g, '');
      
      // If user typed +224 or 224, remove it (we'll add it back)
      if (cleaned.startsWith('224')) {
        cleaned = cleaned.substring(3);
      }
      
      // Limit to 9 digits (standard Guinean phone number length)
      if (cleaned.length > 9) {
        cleaned = cleaned.substring(0, 9);
      }
      
      // Always store with +224 prefix
      const formattedPhone = cleaned ? '+224' + cleaned : '';
      setFormData((prev) => ({ ...prev, [field]: formattedPhone }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Search for existing patient
  const handleSearchPatient = async () => {
    if (!searchQuery.trim()) {
      toast.error('Veuillez entrer un numéro de téléphone ou un ID Vitalis');
      return;
    }

    setIsSearching(true);
    try {
      const query = searchQuery.trim();
      
      // Search by phone or Vitalis ID via API
      const response = await getPatients({ search: query, limit: 10 });
      
      if (response.success && response.data) {
        const patients = Array.isArray(response.data)
          ? response.data
          : (response.data.patients || []);
        const foundPatient = patients.find(
          (p: Patient) =>
            (p.phone && p.phone.includes(query)) ||
            (p.vitalisId && p.vitalisId.toLowerCase().includes(query.toLowerCase()))
        );

        if (foundPatient) {
          setExistingPatient(foundPatient);
          // Pre-fill form with existing patient data
          setFormData({
            firstName: foundPatient.firstName,
            lastName: foundPatient.lastName,
            dateOfBirth: foundPatient.dateOfBirth,
            gender: foundPatient.gender,
            phone: foundPatient.phone,
            email: foundPatient.email || '',
            address: foundPatient.address || '',
            emergencyContact: '',
            bloodType: foundPatient.bloodType || '',
            allergies: foundPatient.allergies?.join(', ') || '',
          });
          // Pre-fill assurance et remise pour éviter d'écraser les données existantes
          setInsuranceData({
            isInsured: !!foundPatient.isInsured,
            establishmentId: foundPatient.insuranceEstablishmentId || foundPatient.insuranceEstablishment?.id || '',
            coveragePercent: foundPatient.insuranceCoveragePercent ?? 0,
            memberNumber: foundPatient.insuranceMemberNumber || '',
          });
          setDiscountData({
            hasDiscount: !!(foundPatient.hasDiscount && (foundPatient.discountPercent ?? 0) > 0),
            discountPercent: foundPatient.discountPercent ?? 0,
          });
          setGeneratedId(foundPatient.vitalisId);
          toast.success('Patient trouvé !', {
            description: `ID Vitalis: ${foundPatient.vitalisId}`,
          });
          // Skip to payment step for existing patient
          setCurrentStep(2);
        } else {
          toast.error('Patient non trouvé', {
            description: 'Aucun patient ne correspond à votre recherche',
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la recherche du patient:', error);
      toast.error('Erreur', {
        description: 'Impossible de rechercher le patient',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search and start new registration
  const handleNewPatient = () => {
    setSearchQuery('');
    setExistingPatient(null);
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      bloodType: '',
      allergies: '',
    });
    setGeneratedId(null);
    setCurrentStep(1);
  };

  const handleCopyId = () => {
    if (generatedId) {
      navigator.clipboard.writeText(generatedId);
      setCopied(true);
      toast.success('ID copié dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.gender) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    return true;
  };

  const processPaymentStep = async () => {
    setConfirmPaymentOpen(false);
    if (activeTab === 'existing' && existingPatient) {
      setIsProcessing(true);
      try {
        const paymentResponse = await registerPatientPayment(existingPatient.id, {
          method: paymentData.method,
          amount: totalAmount,
          type: 'consultation',
          consultationTypeIds: selectedConsultationTypeIds.length > 0 ? selectedConsultationTypeIds : undefined,
          reference: paymentData.reference || undefined,
          insurance: insuranceData.isInsured
            ? {
                isInsured: true,
                establishmentId: insuranceData.establishmentId || undefined,
                coveragePercent: insuranceData.coveragePercent,
                memberNumber: insuranceData.memberNumber?.trim() || undefined,
              }
            : { isInsured: false },
          discount: {
            hasDiscount: discountData.hasDiscount,
            discountPercent: discountData.hasDiscount ? discountData.discountPercent : 0,
          },
        });

        if (paymentResponse.success && paymentResponse.data) {
          const paymentId = paymentResponse.data.id || paymentResponse.data.paymentId;
          setCreatedPaymentId(paymentId);

          if (selectedBed && selectedBed !== 'none') {
            try {
              await occupyBedApi(selectedBed, existingPatient.id);
              const bedsResponse = await getAvailableBeds();
              if (bedsResponse.success && bedsResponse.data) {
                const bedsData = Array.isArray(bedsResponse.data)
                  ? bedsResponse.data
                  : bedsResponse.data.beds || [];
                setAvailableBeds(bedsData);
              }
            } catch (error) {
              console.error('Erreur lors de l\'occupation du lit:', error);
              toast.error('Erreur', {
                description: 'Le paiement a été enregistré mais l\'occupation du lit a échoué',
              });
            }
          }

          toast.success('Paiement enregistré !', {
            description: `Ligne de paiement créée pour ${existingPatient.firstName} ${existingPatient.lastName}`,
          });
          setCurrentStep(3);
        } else {
          toast.error('Erreur', {
            description: paymentResponse.message || 'Impossible d\'enregistrer le paiement',
          });
        }
      } catch (error: any) {
        console.error('Erreur lors de l\'enregistrement du paiement:', error);
        toast.error('Erreur', {
          description: error?.message || 'Impossible d\'enregistrer le paiement',
        });
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (activeTab === 'new') {
      setIsProcessing(true);
      try {
        const registerResponse = await registerPatientApi({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender as 'M' | 'F',
          phone: formData.phone,
          email: formData.email?.trim() || undefined,
          address: formData.address?.trim() || undefined,
          emergencyContact: formData.emergencyContact?.trim() || undefined,
          payment: {
            method: paymentData.method,
            amount: totalAmount,
            reference: paymentData.reference || undefined,
            consultationTypeIds: selectedConsultationTypeIds.length > 0 ? selectedConsultationTypeIds : undefined,
          },
          bedId: selectedBed && selectedBed !== 'none' ? selectedBed : undefined,
          assignDoctor: false,
          insurance: insuranceData.isInsured
            ? {
                isInsured: true,
                establishmentId: insuranceData.establishmentId || undefined,
                coveragePercent: insuranceData.coveragePercent,
                memberNumber: insuranceData.memberNumber?.trim() || undefined,
              }
            : { isInsured: false },
          discount: {
            hasDiscount: discountData.hasDiscount,
            discountPercent: discountData.hasDiscount ? discountData.discountPercent : 0,
          },
        });

        if (registerResponse.success && registerResponse.data) {
          const patientData = registerResponse.data.patient || registerResponse.data;
          const patientId = patientData.id;
          const vitalisId = patientData.vitalisId;
          const paymentId = registerResponse.data.payment?.id || registerResponse.data.paymentId;

          setCreatedPatientId(patientId);
          setCreatedPaymentId(paymentId);
          setGeneratedId(vitalisId);

          if (selectedBed && selectedBed !== 'none') {
            const bedsResponse = await getAvailableBeds();
            if (bedsResponse.success && bedsResponse.data) {
              const bedsData = Array.isArray(bedsResponse.data)
                ? bedsResponse.data
                : bedsResponse.data.beds || [];
              setAvailableBeds(bedsData);
            }
          }

          toast.success('Patient créé avec succès !', {
            description: `ID Vitalis: ${vitalisId}`,
          });
          setCurrentStep(2);
        } else {
          toast.error('Erreur', {
            description: registerResponse.message || 'Impossible de créer le patient',
          });
        }
      } catch (error: any) {
        console.error('Erreur lors de la création du patient:', error);
        toast.error('Erreur', {
          description: error?.message || 'Impossible de créer le patient',
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const runPaymentStep = () => {
    if (paymentData.method === 'orange_money' && !paymentData.reference) {
      toast.error('Veuillez entrer la référence Orange Money');
      return;
    }
    if (activeTab === 'existing') {
      if (!existingPatient) {
        toast.error('Veuillez rechercher et sélectionner un patient');
        return;
      }
    } else {
      if (!validateStep1()) return;
    }
    if (insuranceData.isInsured && !insuranceData.memberNumber?.trim()) {
      toast.error('Numéro identifiant assureur requis', {
        description: 'Veuillez saisir le numéro d\'identifiant chez l\'assureur lorsque l\'assurance est activée.',
      });
      return;
    }
    setConfirmPaymentOpen(true);
  };

  const handleNextStep = async () => {
    // Étape 1 : Paiement (patient nouveau)
    if (currentStep === 1) {
      runPaymentStep();
      return;
    }

    // Étape 2 : Patient existant = formulaire paiement visible ici → enregistrer paiement puis passer au médecin
    //           Patient nouveau = ID déjà généré → passer directement au médecin
    if (currentStep === 2) {
      if (activeTab === 'existing' && existingPatient) {
        runPaymentStep();
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!selectedDoctor) {
        toast.error('Veuillez sélectionner un médecin');
        return;
      }

      const patientId = activeTab === 'existing' ? existingPatient?.id : createdPatientId;
      if (!patientId) {
        toast.error('Erreur', {
          description: 'ID patient manquant',
        });
        return;
      }

      if (!createdPaymentId) {
        toast.error('Erreur', {
          description: 'ID paiement manquant',
        });
        return;
      }

      setConfirmAssignmentOpen(true);
      return;
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleConfirmAssignment = async () => {
    setConfirmAssignmentOpen(false);
    const patientId = activeTab === 'existing' ? existingPatient?.id : createdPatientId;
    if (!patientId || !createdPaymentId || !selectedDoctor) return;
    setIsProcessing(true);
    try {
      const assignmentResponse = await createAssignment({
        patientId,
        doctorId: selectedDoctor,
        paymentId: createdPaymentId,
      });
      if (assignmentResponse.success) {
        const doctor = doctors.find((d) => d.id === selectedDoctor);
        toast.success('Processus terminé !', {
          description: `Patient assigné à ${doctor?.name || 'médecin'}`,
        });
        setTimeout(() => navigate('/reception'), 1500);
      } else {
        toast.error('Erreur', {
          description: assignmentResponse.message || 'Impossible d\'assigner le médecin',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'assignation du médecin:', error);
      toast.error('Erreur', { description: error?.message || 'Impossible d\'assigner le médecin' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Enregistrer un patient"
        description="Paiement de consultation et assignation médecin"
      />

      {/* Stepper - Dynamic based on tab and patient type */}
      <Card>
        <CardContent className="py-6">
          <Stepper 
            steps={activeTab === 'existing' && existingPatient 
              ? steps.filter((_, idx) => idx !== 1) // Remove ID step for existing patients
              : steps
            } 
            currentStep={activeTab === 'existing' && existingPatient && currentStep === 3
              ? 2 // Map step 3 to step 2 in stepper for existing patients
              : currentStep
            } 
            showDetails={true} 
          />
        </CardContent>
      </Card>

      {/* Tabs for existing vs new patient */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'existing' | 'new')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing" className="gap-2">
            <User className="h-4 w-4" />
            Patient déjà enregistré
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Patient non enregistré
          </TabsTrigger>
        </TabsList>

        {/* Tab: Existing Patient */}
        <TabsContent value="existing" className="space-y-6 mt-6">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Rechercher un patient existant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Numéro de téléphone ou ID Vitalis"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchPatient();
                      }
                    }}
                  />
                </div>
                <Button onClick={handleSearchPatient} disabled={isSearching} className="gap-2">
                  <Phone className="h-4 w-4" />
                  Rechercher
                </Button>
              </div>
              {existingPatient && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-lg">
                        {existingPatient.firstName} {existingPatient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID Vitalis: <span className="font-mono font-semibold">{existingPatient.vitalisId}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Téléphone: {existingPatient.phone}
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Section - Always visible when patient found */}
          {existingPatient && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Paiement de la consultation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Patient info summary */}
                <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {existingPatient.firstName} {existingPatient.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ID Vitalis: <span className="font-mono">{existingPatient.vitalisId}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {totalAmount.toLocaleString()} GNF
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedBed ? 'Consultation + Lit' : 'Consultation'}
                    </p>
                  </div>
                </div>

                {/* Assurance — patient déjà enregistré */}
                <div className="space-y-4 rounded-lg border p-4 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <span className="font-medium">Patient assuré</span>
                    </div>
                    <Switch
                      checked={insuranceData.isInsured}
                      onCheckedChange={(checked) =>
                        setInsuranceData((prev) => ({
                          ...prev,
                          isInsured: checked,
                          establishmentId: checked ? prev.establishmentId : '',
                          coveragePercent: checked ? prev.coveragePercent : 0,
                          memberNumber: checked ? prev.memberNumber : '',
                        }))
                      }
                    />
                  </div>
                  {insuranceData.isInsured && (
                    <div className="space-y-4 pt-2 border-t">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Établissement d'assurance</Label>
                          <Select
                            value={insuranceData.establishmentId}
                            onValueChange={(value) =>
                              setInsuranceData((prev) => ({ ...prev, establishmentId: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir l'établissement" />
                            </SelectTrigger>
                            <SelectContent>
                              {insuranceEstablishments.map((est) => (
                                <SelectItem key={est.id} value={est.id}>
                                  {est.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Pourcentage de couverture (%)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="Ex: 80"
                            value={insuranceData.coveragePercent || ''}
                            onChange={(e) => {
                              const v = e.target.value === '' ? 0 : Math.min(100, Math.max(0, Number(e.target.value)));
                              setInsuranceData((prev) => ({ ...prev, coveragePercent: v }));
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Sera déduit sur consultation, examens labo et imagerie
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Numéro d'identifiant chez l'assureur <span className="text-destructive">*</span></Label>
                        <Input
                          placeholder="Ex. numéro de contrat, matricule..."
                          value={insuranceData.memberNumber}
                          onChange={(e) =>
                            setInsuranceData((prev) => ({ ...prev, memberNumber: e.target.value }))
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Numéro de contrat ou matricule fourni par l'assureur
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remise — patient déjà enregistré */}
                <div className="space-y-4 rounded-lg border p-4 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-primary" />
                      <span className="font-medium">Bénéficie d'une remise</span>
                    </div>
                    <Switch
                      checked={discountData.hasDiscount}
                      onCheckedChange={(checked) =>
                        setDiscountData((prev) => ({
                          ...prev,
                          hasDiscount: checked,
                          discountPercent: checked ? prev.discountPercent : 0,
                        }))
                      }
                    />
                  </div>
                  {discountData.hasDiscount && (
                    <div className="pt-2 border-t space-y-2">
                      <Label>Pourcentage de remise (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Ex: 10"
                        value={discountData.discountPercent || ''}
                        onChange={(e) => {
                          const v = e.target.value === '' ? 0 : Math.min(100, Math.max(0, Number(e.target.value)));
                          setDiscountData((prev) => ({ ...prev, discountPercent: v }));
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Appliqué sur le ou les paiements possibles
                      </p>
                    </div>
                  )}
                </div>

                {/* Consultation types */}
                <div className="space-y-3">
                  <Label>Consultations demandées</Label>
                  {consultationTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-4 p-3 rounded-lg border bg-card">
                      {consultationTypes.map((t) => (
                        <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={selectedConsultationTypeIds.includes(t.id)}
                            onCheckedChange={(checked) => {
                              setSelectedConsultationTypeIds((prev) =>
                                checked ? [...prev, t.id] : prev.filter((id) => id !== t.id)
                              );
                            }}
                          />
                          <span className="text-sm font-medium">{t.name}</span>
                          <span className="text-sm text-muted-foreground">({(Number(t.price) || 0).toLocaleString()} GNF)</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun type de consultation configuré. L&apos;admin peut en ajouter dans Types de consultation.</p>
                  )}
                </div>

                {/* Bed selection */}
                <div className="space-y-3">
                  <Label>Sélectionner un lit (optionnel)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select value={bedTypeFilter} onValueChange={(value: 'all' | 'classic' | 'vip') => {
                      setBedTypeFilter(value);
                      setSelectedBed('none'); // Reset bed selection when filter changes
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrer par type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les lits</SelectItem>
                        <SelectItem value="classic">Lits classiques</SelectItem>
                        <SelectItem value="vip">Lits VIP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedBed} onValueChange={setSelectedBed}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un lit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun lit</SelectItem>
                        {filteredBeds.map((bed) => (
                          <SelectItem key={bed.id} value={bed.id}>
                            Lit {bed.number} - {bed.type === 'vip' ? 'VIP' : 'Classique'}
                          {Number(bed.additionalFee) > 0 && ` (+${(Number(bed.additionalFee) || 0).toLocaleString()} GNF)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedBed && selectedBed !== 'none' && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Lit {availableBeds.find((b) => b.id === selectedBed)?.number}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Type: {availableBeds.find((b) => b.id === selectedBed)?.type === 'vip' ? 'VIP' : 'Classique'}
                          </p>
                        </div>
                        {(() => {
                          const bed = availableBeds.find((b) => b.id === selectedBed);
                          const fee = Number(bed?.additionalFee) || 0;
                          return fee > 0 ? (
                            <p className="font-semibold text-primary">+{fee.toLocaleString()} GNF</p>
                          ) : bed ? (
                            <p className="font-semibold text-success">Gratuit</p>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount breakdown */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Consultation(s)</span>
                    <span className="font-medium">{consultationAmount.toLocaleString()} GNF</span>
                  </div>
                  {selectedBed && selectedBed !== 'none' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Lit {availableBeds.find((b) => b.id === selectedBed)?.number} ({availableBeds.find((b) => b.id === selectedBed)?.type === 'vip' ? 'VIP' : 'Classique'})
                      </span>
                      <span className="font-medium">
                        {(() => {
                          const bed = availableBeds.find((b) => b.id === selectedBed);
                          return bed && Number(bed.additionalFee) === 0 ? 'Gratuit' : `+${(Number(bed?.additionalFee) || 0).toLocaleString()} GNF`;
                        })()}
                      </span>
                    </div>
                  )}
                  {insuranceDeduction > 0 && (
                    <div className="flex items-center justify-between text-sm text-success">
                      <span className="text-muted-foreground">Déduction assurance ({insuranceData.coveragePercent}%)</span>
                      <span className="font-medium">-{insuranceDeduction.toLocaleString()} GNF</span>
                    </div>
                  )}
                  {discountDeduction > 0 && (
                    <div className="flex items-center justify-between text-sm text-success">
                      <span className="text-muted-foreground">Remise ({discountData.discountPercent}%)</span>
                      <span className="font-medium">-{discountDeduction.toLocaleString()} GNF</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t font-semibold text-lg">
                    <span>Total à payer</span>
                    <span className="text-primary">{totalAmount.toLocaleString()} GNF</span>
                  </div>
                </div>

                {/* Payment method */}
                <div className="space-y-3">
                  <Label>Mode de paiement</Label>
                  <RadioGroup
                    value={paymentData.method}
                    onValueChange={(value: 'cash' | 'orange_money') =>
                      setPaymentData((prev) => ({ ...prev, method: value }))
                    }
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="cash" id="cash-existing" className="peer sr-only" />
                      <Label
                        htmlFor="cash-existing"
                        className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                      >
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                          <Banknote className="h-6 w-6 text-success" />
                        </div>
                        <div>
                          <p className="font-medium">Espèces</p>
                          <p className="text-sm text-muted-foreground">Paiement en liquide</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="orange_money" id="orange_money-existing" className="peer sr-only" />
                      <Label
                        htmlFor="orange_money-existing"
                        className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                      >
                        <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                          <Smartphone className="h-6 w-6 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">Orange Money</p>
                          <p className="text-sm text-muted-foreground">Paiement mobile</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Orange Money reference */}
                {paymentData.method === 'orange_money' && (
                  <div className="space-y-2">
                    <Label htmlFor="reference-existing">
                      Référence transaction <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="reference-existing"
                      placeholder="Ex: OM-XXXXXXX"
                      value={paymentData.reference}
                      onChange={(e) =>
                        setPaymentData((prev) => ({ ...prev, reference: e.target.value }))
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: New Patient */}
        <TabsContent value="new" className="space-y-6 mt-6">
          {/* New Patient Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Entrez le nom"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    Prénom(s) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Entrez le prénom"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                  />
                </div>
              </div>

              {/* Birth and gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Sexe <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Téléphone <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                      +224
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="612 345 678"
                      value={formData.phone.startsWith('+224') ? formData.phone.replace(/^\+224/, '') : formData.phone.replace(/^\+?224/, '')}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="pl-14"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Le préfixe +224 sera ajouté automatiquement
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="patient@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Adresse
                </Label>
                <Textarea
                  id="address"
                  placeholder="Adresse complète du patient"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Section - Always visible */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Paiement de la consultation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Patient info summary */}
              <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.gender === 'M' ? 'Homme' : 'Femme'} • {formData.phone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {totalAmount.toLocaleString()} GNF
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBed ? 'Consultation + Lit' : 'Consultation'}
                  </p>
                </div>
              </div>

              {/* Assurance — nouveau patient (inscription) */}
              <div className="space-y-4 rounded-lg border p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="font-medium">Patient assuré</span>
                  </div>
                  <Switch
                    checked={insuranceData.isInsured}
                    onCheckedChange={(checked) =>
                      setInsuranceData((prev) => ({
                        ...prev,
                        isInsured: checked,
                        establishmentId: checked ? prev.establishmentId : '',
                        coveragePercent: checked ? prev.coveragePercent : 0,
                        memberNumber: checked ? prev.memberNumber : '',
                      }))
                    }
                  />
                </div>
                {insuranceData.isInsured && (
                  <div className="space-y-4 pt-2 border-t">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Établissement d'assurance</Label>
                        <Select
                          value={insuranceData.establishmentId}
                          onValueChange={(value) =>
                            setInsuranceData((prev) => ({ ...prev, establishmentId: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir l'établissement" />
                          </SelectTrigger>
                          <SelectContent>
                            {insuranceEstablishments.map((est) => (
                              <SelectItem key={est.id} value={est.id}>
                                {est.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Pourcentage de couverture (%)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="Ex: 80"
                          value={insuranceData.coveragePercent || ''}
                          onChange={(e) => {
                            const v = e.target.value === '' ? 0 : Math.min(100, Math.max(0, Number(e.target.value)));
                            setInsuranceData((prev) => ({ ...prev, coveragePercent: v }));
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          Sera déduit sur consultation, examens labo et imagerie
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Numéro d'identifiant chez l'assureur <span className="text-destructive">*</span></Label>
                      <Input
                        placeholder="Ex. numéro de contrat, matricule..."
                        value={insuranceData.memberNumber}
                        onChange={(e) =>
                          setInsuranceData((prev) => ({ ...prev, memberNumber: e.target.value }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Numéro de contrat ou matricule fourni par l'assureur
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Remise — nouveau patient (inscription) */}
              <div className="space-y-4 rounded-lg border p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <span className="font-medium">Bénéficie d'une remise</span>
                  </div>
                  <Switch
                    checked={discountData.hasDiscount}
                    onCheckedChange={(checked) =>
                      setDiscountData((prev) => ({
                        ...prev,
                        hasDiscount: checked,
                        discountPercent: checked ? prev.discountPercent : 0,
                      }))
                    }
                  />
                </div>
                {discountData.hasDiscount && (
                  <div className="pt-2 border-t space-y-2">
                    <Label>Pourcentage de remise (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Ex: 10"
                      value={discountData.discountPercent || ''}
                      onChange={(e) => {
                        const v = e.target.value === '' ? 0 : Math.min(100, Math.max(0, Number(e.target.value)));
                        setDiscountData((prev) => ({ ...prev, discountPercent: v }));
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Appliqué sur le ou les paiements possibles
                    </p>
                  </div>
                )}
              </div>

              {/* Consultation types */}
              <div className="space-y-3">
                <Label>Consultations demandées</Label>
                {consultationTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-4 p-3 rounded-lg border bg-card">
                    {consultationTypes.map((t) => (
                      <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedConsultationTypeIds.includes(t.id)}
                          onCheckedChange={(checked) => {
                            setSelectedConsultationTypeIds((prev) =>
                              checked ? [...prev, t.id] : prev.filter((id) => id !== t.id)
                            );
                          }}
                        />
                        <span className="text-sm font-medium">{t.name}</span>
                        <span className="text-sm text-muted-foreground">({(Number(t.price) || 0).toLocaleString()} GNF)</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun type de consultation configuré. L&apos;admin peut en ajouter dans Types de consultation.</p>
                )}
              </div>

              {/* Bed selection */}
              <div className="space-y-3">
                <Label>Sélectionner un lit (optionnel)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select value={bedTypeFilter} onValueChange={(value: 'all' | 'classic' | 'vip') => {
                    setBedTypeFilter(value);
                    setSelectedBed('none'); // Reset bed selection when filter changes
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrer par type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les lits</SelectItem>
                      <SelectItem value="classic">Lits classiques</SelectItem>
                      <SelectItem value="vip">Lits VIP</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedBed} onValueChange={setSelectedBed}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un lit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun lit</SelectItem>
                      {filteredBeds.map((bed) => (
                        <SelectItem key={bed.id} value={bed.id}>
                          Lit {bed.number} - {bed.type === 'vip' ? 'VIP' : 'Classique'}
                          {Number(bed.additionalFee) > 0 && ` (+${(Number(bed.additionalFee) || 0).toLocaleString()} GNF)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedBed && selectedBed !== 'none' && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Lit {availableBeds.find((b) => b.id === selectedBed)?.number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Type: {availableBeds.find((b) => b.id === selectedBed)?.type === 'vip' ? 'VIP' : 'Classique'}
                        </p>
                      </div>
                      {(() => {
                        const bed = availableBeds.find((b) => b.id === selectedBed);
                        const fee = Number(bed?.additionalFee) || 0;
                        return fee === 0 && bed ? (
                          <p className="font-semibold text-success">Gratuit</p>
                        ) : fee > 0 ? (
                          <p className="font-semibold text-primary">+{fee.toLocaleString()} GNF</p>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}
              </div>

                {/* Amount breakdown */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Consultation(s)</span>
                    <span className="font-medium">{consultationAmount.toLocaleString()} GNF</span>
                  </div>
                  {selectedBed && selectedBed !== 'none' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Lit {availableBeds.find((b) => b.id === selectedBed)?.number} ({availableBeds.find((b) => b.id === selectedBed)?.type === 'vip' ? 'VIP' : 'Classique'})
                      </span>
                      <span className="font-medium">
                        {(() => {
                          const bed = availableBeds.find((b) => b.id === selectedBed);
                          return bed && Number(bed.additionalFee) === 0 ? 'Gratuit' : `+${(Number(bed?.additionalFee) || 0).toLocaleString()} GNF`;
                        })()}
                      </span>
                    </div>
                  )}
                  {insuranceDeduction > 0 && (
                    <div className="flex items-center justify-between text-sm text-success">
                      <span className="text-muted-foreground">Déduction assurance ({insuranceData.coveragePercent}%)</span>
                      <span className="font-medium">-{insuranceDeduction.toLocaleString()} GNF</span>
                    </div>
                  )}
                  {discountDeduction > 0 && (
                    <div className="flex items-center justify-between text-sm text-success">
                      <span className="text-muted-foreground">Remise ({discountData.discountPercent}%)</span>
                      <span className="font-medium">-{discountDeduction.toLocaleString()} GNF</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t font-semibold text-lg">
                    <span>Total à payer</span>
                    <span className="text-primary">{totalAmount.toLocaleString()} GNF</span>
                  </div>
                </div>

              {/* Payment method */}
              <div className="space-y-3">
                <Label>Mode de paiement</Label>
                <RadioGroup
                  value={paymentData.method}
                  onValueChange={(value: 'cash' | 'orange_money') =>
                    setPaymentData((prev) => ({ ...prev, method: value }))
                  }
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="cash" id="cash-new" className="peer sr-only" />
                    <Label
                      htmlFor="cash-new"
                      className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                    >
                      <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                        <Banknote className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">Espèces</p>
                        <p className="text-sm text-muted-foreground">Paiement en liquide</p>
                      </div>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="orange_money" id="orange_money-new" className="peer sr-only" />
                    <Label
                      htmlFor="orange_money-new"
                      className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                    >
                      <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium">Orange Money</p>
                        <p className="text-sm text-muted-foreground">Paiement mobile</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Orange Money reference */}
              {paymentData.method === 'orange_money' && (
                <div className="space-y-2">
                  <Label htmlFor="reference-new">
                    Référence transaction <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reference-new"
                    placeholder="Ex: OM-XXXXXXX"
                    value={paymentData.reference}
                    onChange={(e) =>
                      setPaymentData((prev) => ({ ...prev, reference: e.target.value }))
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Step 2: ID Generated (only for new patients) */}
      {currentStep === 2 && generatedId && activeTab === 'new' && (
        <Card className="border-2 border-primary/30">
          <CardContent className="py-10">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Paiement validé - ID Vitalis généré !
                </h2>
                <p className="text-muted-foreground">
                  {formData.firstName} {formData.lastName}
                </p>
              </div>

              {/* ID Display */}
              <div className="bg-muted/50 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground mb-2">Identifiant unique VITALIS</p>
                <p className="text-3xl font-mono font-bold text-primary">{generatedId}</p>
              </div>

              <Button variant="outline" onClick={handleCopyId} className="gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    ID Copié
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier l'identifiant
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground">
                Cet identifiant sera utilisé pour tous les documents et dossiers du patient.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Doctor Assignment */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Assigner un médecin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient info summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {existingPatient 
                      ? `${existingPatient.firstName} ${existingPatient.lastName}`
                      : `${formData.firstName} ${formData.lastName}`
                    }
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {existingPatient ? existingPatient.vitalisId : generatedId}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Paiement validé</span>
                </div>
              </div>
            </div>

            {/* Doctor selection */}
            <div className="space-y-3">
              <Label>Sélectionner un médecin</Label>
              {isLoadingDoctors ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p>Chargement des médecins...</p>
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Aucun médecin disponible</p>
                </div>
              ) : (
                <RadioGroup
                  value={selectedDoctor}
                  onValueChange={setSelectedDoctor}
                  className="grid gap-3"
                >
                  {doctors.map((doctor) => (
                  <div key={doctor.id}>
                    <RadioGroupItem value={doctor.id} id={doctor.id} className="peer sr-only" />
                    <Label
                      htmlFor={doctor.id}
                      className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.department}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
                          Disponible
                        </span>
                      </div>
                    </Label>
                  </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Précédent
        </Button>
        <Button onClick={handleNextStep} className="gap-2" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : currentStep === 3 ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Terminer
            </>
          ) : (
            <>
              Suivant
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Alerte de confirmation paiement */}
      <AlertDialog open={confirmPaymentOpen} onOpenChange={setConfirmPaymentOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer le paiement</AlertDialogTitle>
            <AlertDialogDescription>
              {activeTab === 'existing' && existingPatient ? (
                <>
                  Enregistrer le paiement de <strong>{totalAmount.toLocaleString()} GNF</strong> pour{' '}
                  <strong>{existingPatient.firstName} {existingPatient.lastName}</strong> ?
                </>
              ) : (
                <>
                  Créer le patient <strong>{formData.firstName} {formData.lastName}</strong> et enregistrer le paiement
                  de <strong>{totalAmount.toLocaleString()} GNF</strong> ?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={processPaymentStep}>
              Confirmer le paiement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alerte de confirmation assignation médecin */}
      <AlertDialog open={confirmAssignmentOpen} onOpenChange={setConfirmAssignmentOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'assignation</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const doctorName = doctors.find((d) => d.id === selectedDoctor)?.name || 'le médecin';
                const patientName = activeTab === 'existing' && existingPatient
                  ? `${existingPatient.firstName} ${existingPatient.lastName}`
                  : `${formData.firstName} ${formData.lastName}`;
                return <>Confirmer l'assignation de <strong>{patientName}</strong> à <strong>{doctorName}</strong> ?</>;
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAssignment}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RegisterPatient;
