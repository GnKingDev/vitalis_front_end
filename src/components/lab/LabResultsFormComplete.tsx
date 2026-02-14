import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  FlaskConical,
  Edit,
  Eye,
  Plus,
  X,
} from 'lucide-react';
import type { Patient, User, LabRequest, ResultAlert } from '@/types';

interface LabResultsFormCompleteProps {
  labRequest: LabRequest;
  patient: Patient;
  doctor: User | null;
  onSave?: (data: LabResultData) => void;
}

export interface LabResultData {
  // Header
  labNumber: string;
  serviceDate: string;
  requestedBy: string;
  
  // Patient
  patientName: string;
  patientAge: number;
  vitalisId: string;
  
  // Results by exam
  examResults: { [examId: string]: ParameterRow[] };
  
  // Comments
  labComments?: string;
  interpretation?: string;
}

interface ParameterRow {
  id: string;
  parameterName: string;
  value: string;
  unit: string;
  referenceRange: string;
  alert?: ResultAlert;
}

const LabResultsFormComplete: React.FC<LabResultsFormCompleteProps> = ({
  labRequest,
  patient,
  doctor,
  onSave,
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Initialize form data with empty results for each requested exam
  const initialExamResults = useMemo(() => {
    const results: { [examId: string]: ParameterRow[] } = {};
    labRequest.exams.forEach(exam => {
      results[exam.id] = [];
    });
    return results;
  }, [labRequest.exams]);

  const [formData, setFormData] = useState<LabResultData>({
    labNumber: labRequest.id,
    serviceDate: new Date(labRequest.createdAt).toISOString().split('T')[0],
    requestedBy: doctor?.name || doctor?.id || '',
    patientName: `${patient.firstName} ${patient.lastName}`,
    patientAge: calculateAge(patient.dateOfBirth),
    vitalisId: patient.vitalisId,
    examResults: initialExamResults,
    labComments: '',
    interpretation: '',
  });

  function calculateAge(dateOfBirth: string): number {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  const calculateAlert = (value: string, referenceRange: string): ResultAlert | undefined => {
    if (!value || !referenceRange) return undefined;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return undefined;

    if (referenceRange.startsWith('<')) {
      const max = parseFloat(referenceRange.substring(1));
      return numValue >= max ? 'high' : 'normal';
    }
    if (referenceRange.startsWith('>')) {
      const min = parseFloat(referenceRange.substring(1));
      return numValue <= min ? 'low' : 'normal';
    }

    const rangeParts = referenceRange.split('-');
    if (rangeParts.length === 2) {
      const min = parseFloat(rangeParts[0]);
      const max = parseFloat(rangeParts[1]);
      if (numValue < min) return 'low';
      if (numValue > max) return 'high';
      return 'normal';
    }

    return undefined;
  };

  const updateParameter = (examId: string, paramId: string, field: 'parameterName' | 'value' | 'unit' | 'referenceRange', newValue: string) => {
    setFormData(prev => {
      const examParams = prev.examResults[examId] || [];
      
      const updated = examParams.map(param => {
        if (param.id === paramId) {
          const updatedParam = { ...param, [field]: newValue };
          // Recalculate alert if value or referenceRange changed
          if (field === 'value' || field === 'referenceRange') {
            updatedParam.alert = calculateAlert(
              field === 'value' ? newValue : updatedParam.value,
              field === 'referenceRange' ? newValue : updatedParam.referenceRange
            );
          }
          return updatedParam;
        }
        return param;
      });
      
      return {
        ...prev,
        examResults: {
          ...prev.examResults,
          [examId]: updated,
        },
      };
    });
  };

  const addCustomParameter = (examId: string) => {
    const newParam: ParameterRow = {
      id: `custom-${Date.now()}-${Math.random()}`,
      parameterName: '',
      value: '',
      unit: '',
      referenceRange: '',
    };
    
    setFormData(prev => {
      const examParams = prev.examResults[examId] || [];
      return {
        ...prev,
        examResults: {
          ...prev.examResults,
          [examId]: [...examParams, newParam],
        },
      };
    });
  };

  const removeParameter = (examId: string, paramId: string) => {
    setFormData(prev => {
      const examParams = prev.examResults[examId] || [];
      return {
        ...prev,
        examResults: {
          ...prev.examResults,
          [examId]: examParams.filter(p => p.id !== paramId),
        },
      };
    });
  };

  const renderExamTable = (examId: string, examName: string) => {
    const parameters = formData.examResults[examId] || [];
    
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{examName}</h3>
            <p className="text-sm text-muted-foreground">
              {parameters.length} paramètre{parameters.length > 1 ? 's' : ''}
            </p>
          </div>
          {!isPreviewMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCustomParameter(examId)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter paramètre
            </Button>
          )}
        </div>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Paramètre</TableHead>
                <TableHead className="w-[150px]">Résultat</TableHead>
                <TableHead className="w-[100px]">Unités</TableHead>
                <TableHead className="w-[150px]">Valeurs de référence</TableHead>
                {!isPreviewMode && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {parameters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isPreviewMode ? 4 : 5} className="text-center py-8 text-muted-foreground">
                    Aucun paramètre ajouté. Cliquez sur "Ajouter paramètre" pour commencer.
                  </TableCell>
                </TableRow>
              ) : (
                parameters.map((param) => (
                  <TableRow key={param.id}>
                    <TableCell className="font-medium">
                      {isPreviewMode ? (
                        param.parameterName || '-'
                      ) : (
                        <Input
                          value={param.parameterName}
                          onChange={(e) => updateParameter(examId, param.id, 'parameterName', e.target.value)}
                          placeholder="Nom du paramètre"
                          className="w-full"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {isPreviewMode ? (
                        <span className="font-medium">{param.value || '-'}</span>
                      ) : (
                        <Input
                          type="text"
                          value={param.value}
                          onChange={(e) => updateParameter(examId, param.id, 'value', e.target.value)}
                          placeholder="Saisir valeur"
                          className="w-full"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {isPreviewMode ? (
                        <span className="text-sm text-muted-foreground">{param.unit || '-'}</span>
                      ) : (
                        <Input
                          type="text"
                          value={param.unit}
                          onChange={(e) => updateParameter(examId, param.id, 'unit', e.target.value)}
                          placeholder="Unité"
                          className="w-full"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {isPreviewMode ? (
                        <span className="text-sm text-muted-foreground">{param.referenceRange || '-'}</span>
                      ) : (
                        <Input
                          type="text"
                          value={param.referenceRange}
                          onChange={(e) => updateParameter(examId, param.id, 'referenceRange', e.target.value)}
                          placeholder="Ex: 3.5-5.0"
                          className="w-full"
                        />
                      )}
                    </TableCell>
                    {!isPreviewMode && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParameter(examId, param.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  if (isPreviewMode) {
    return (
      <div className="space-y-6 print:space-y-4">
        {/* Preview Mode - Print View */}
        <div className="flex items-center justify-between mb-4 no-print">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <span className="font-semibold">Mode Aperçu</span>
          </div>
          <div className="flex items-center gap-2">
            <Label>Édition</Label>
            <Switch checked={!isPreviewMode} onCheckedChange={(checked) => setIsPreviewMode(!checked)} />
            <Label>Aperçu</Label>
          </div>
        </div>

        {/* Results Tables - One per exam */}
        {labRequest.exams.map((exam) => (
          <div key={exam.id}>
            {renderExamTable(exam.id, exam.name)}
          </div>
        ))}

        {/* Comments */}
        {(formData.labComments || formData.interpretation) && (
          <div className="mt-6 print:mt-4 space-y-4">
            {formData.labComments && (
              <div>
                <p className="text-sm font-semibold mb-2">Commentaires du laboratoire</p>
                <p className="text-sm whitespace-pre-wrap">{formData.labComments}</p>
              </div>
            )}
            {formData.interpretation && (
              <div>
                <p className="text-sm font-semibold mb-2">Interprétation / Notes</p>
                <p className="text-sm whitespace-pre-wrap">{formData.interpretation}</p>
              </div>
            )}
          </div>
        )}

        <style>{`
          @media print {
            body {
              background: white;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="space-y-6">
      {/* Mode Switch */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              <span className="font-semibold">Mode Édition</span>
            </div>
            <div className="flex items-center gap-2">
              <Label>Édition</Label>
              <Switch checked={!isPreviewMode} onCheckedChange={(checked) => setIsPreviewMode(!checked)} />
              <Label>Aperçu</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du rapport</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nom de la clinique</Label>
            <Input value="VITALIS" disabled className="mt-1" />
          </div>
          <div>
            <Label>Numéro de laboratoire</Label>
            <Input
              value={formData.labNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, labNumber: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Date de service</Label>
            <Input
              type="date"
              value={formData.serviceDate}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceDate: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Demandé par</Label>
            <Input
              value={doctor?.name || 'N/A'}
              disabled
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient Block */}
      <Card>
        <CardHeader>
          <CardTitle>Informations patient</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nom du patient</Label>
            <Input
              value={formData.patientName}
              onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Âge</Label>
            <Input
              type="number"
              value={formData.patientAge}
              onChange={(e) => setFormData(prev => ({ ...prev, patientAge: parseInt(e.target.value) || 0 }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label>ID Patient Vitalis</Label>
            <Input value={formData.vitalisId} disabled className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Results Sections - One per requested exam */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Résultats des examens demandés
          </CardTitle>
        </CardHeader>
        <CardContent>
          {labRequest.exams.map((exam) => (
            <div key={exam.id} className="mb-8 last:mb-0">
              {renderExamTable(exam.id, exam.name)}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Commentaires & Conclusion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Commentaires du laboratoire</Label>
            <Textarea
              value={formData.labComments || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, labComments: e.target.value }))}
              placeholder="Ajouter des commentaires..."
              rows={3}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Interprétation / Notes</Label>
            <Textarea
              value={formData.interpretation || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, interpretation: e.target.value }))}
              placeholder="Ajouter une interprétation ou des notes..."
              rows={3}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabResultsFormComplete;
