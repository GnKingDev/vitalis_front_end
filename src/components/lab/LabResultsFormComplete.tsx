import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { Patient, User, LabRequest } from '@/types';

const NUMEROTATION_OPTIONS = [
  'GB', 'LYM', 'MON', 'GRA', 'LYM%', 'MON%', 'GRA%',
  'GR', 'HB', 'HT', 'VGM', 'TCMH', 'CCMH', 'IDRc',
  'PLT', 'THT', 'VPM', 'IDPc',
];

interface LabResultsFormCompleteProps {
  labRequest: LabRequest;
  patient: Patient;
  doctor: User | null;
  onSave?: (data: LabResultData) => void;
  onFormDataChange?: (data: LabResultData | null) => void;
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
  numero: string;
  value: string;
  referenceRange: string;
}

const LabResultsFormComplete: React.FC<LabResultsFormCompleteProps> = ({
  labRequest,
  patient,
  doctor,
  onFormDataChange,
}) => {
  const resultsObj = Array.isArray(labRequest.results) ? labRequest.results[0] : labRequest.results;
  const isReadOnly = (resultsObj as any)?.status === 'sent' || (resultsObj as any)?.status === 'validated';
  const [isPreviewMode, setIsPreviewMode] = useState(isReadOnly);

  const initialExamResults = useMemo(() => {
    const results: { [examId: string]: ParameterRow[] } = {};

    if (isReadOnly && resultsObj && (resultsObj as any).results?.sections) {
      (resultsObj as any).results.sections.forEach((section: any) => {
        const exam = labRequest.exams.find((e: any) =>
          e.name === section.title || e.labExam?.name === section.title
        );
        if (exam) {
          results[exam.id] = section.items.map((item: any, index: number) => ({
            id: `loaded-${exam.id}-${index}`,
            numero: item.numero ?? item.number ?? String(index + 1),
            value: item.value || '',
            referenceRange: item.reference || '',
          }));
        }
      });
    } else {
      labRequest.exams.forEach(exam => {
        results[exam.id] = [];
      });
    }

    return results;
  }, [labRequest.exams, labRequest.results, isReadOnly]);

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

  const [formData, setFormData] = useState<LabResultData>({
    labNumber: labRequest.id,
    serviceDate: new Date(labRequest.createdAt).toISOString().split('T')[0],
    requestedBy: doctor?.name || doctor?.id || '',
    patientName: `${patient.firstName} ${patient.lastName}`,
    patientAge: calculateAge(patient.dateOfBirth),
    vitalisId: patient.vitalisId,
    examResults: initialExamResults,
  });

  useEffect(() => {
    if (!onFormDataChange) return;

    const hasData = Object.values(formData.examResults).some(
      params => params.length > 0 && params.some(p => p.value)
    );

    onFormDataChange(hasData ? formData : null);
  }, [formData, onFormDataChange]);

  const updateParameter = (examId: string, paramId: string, field: 'numero' | 'value' | 'referenceRange', newValue: string) => {
    setFormData(prev => {
      const examParams = prev.examResults[examId] || [];
      const updated = examParams.map(param =>
        param.id === paramId ? { ...param, [field]: newValue } : param
      );
      return {
        ...prev,
        examResults: { ...prev.examResults, [examId]: updated },
      };
    });
  };

  const addParameter = (examId: string) => {
    const newParam: ParameterRow = {
      id: `custom-${Date.now()}-${Math.random()}`,
      numero: '',
      value: '',
      referenceRange: '',
    };
    setFormData(prev => ({
      ...prev,
      examResults: {
        ...prev.examResults,
        [examId]: [...(prev.examResults[examId] || []), newParam],
      },
    }));
  };

  const removeParameter = (examId: string, paramId: string) => {
    setFormData(prev => ({
      ...prev,
      examResults: {
        ...prev.examResults,
        [examId]: prev.examResults[examId].filter(p => p.id !== paramId),
      },
    }));
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
          {!isPreviewMode && !isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => addParameter(examId)}
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
                <TableHead className="w-[100px]">Numérotation</TableHead>
                <TableHead>Résultat</TableHead>
                <TableHead>Valeurs normales</TableHead>
                {!isPreviewMode && !isReadOnly && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {parameters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isPreviewMode ? 3 : 4} className="text-center py-8 text-muted-foreground">
                    Aucun paramètre ajouté. Cliquez sur &quot;Ajouter paramètre&quot; pour commencer.
                  </TableCell>
                </TableRow>
              ) : (
                parameters.map((param) => (
                  <TableRow key={param.id}>
                    <TableCell>
                      {isPreviewMode ? (
                        param.numero || '-'
                      ) : (
                        <div className="space-y-1">
                          <Label htmlFor={`numero-${param.id}`} className="text-xs text-muted-foreground">
                            Numérotation
                          </Label>
                          <datalist id={`numero-list-${param.id}`}>
                            {NUMEROTATION_OPTIONS.map(opt => (
                              <option key={opt} value={opt} />
                            ))}
                          </datalist>
                          <Input
                            id={`numero-${param.id}`}
                            list={`numero-list-${param.id}`}
                            value={param.numero}
                            onChange={(e) => updateParameter(examId, param.id, 'numero', e.target.value)}
                            placeholder="Ex: GB, HB..."
                            disabled={isReadOnly}
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isPreviewMode ? (
                        <span className="font-medium">{param.value || '-'}</span>
                      ) : (
                        <div className="space-y-1">
                          <Label htmlFor={`value-${param.id}`} className="text-xs text-muted-foreground">
                            Résultat
                          </Label>
                          <Input
                            id={`value-${param.id}`}
                            value={param.value}
                            onChange={(e) => updateParameter(examId, param.id, 'value', e.target.value)}
                            placeholder="Ex: 14.2"
                            disabled={isReadOnly}
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isPreviewMode ? (
                        <span className="text-sm text-muted-foreground">{param.referenceRange || '-'}</span>
                      ) : (
                        <div className="space-y-1">
                          <Label htmlFor={`ref-${param.id}`} className="text-xs text-muted-foreground">
                            Valeurs normales
                          </Label>
                          <Input
                            id={`ref-${param.id}`}
                            value={param.referenceRange}
                            onChange={(e) => updateParameter(examId, param.id, 'referenceRange', e.target.value)}
                            placeholder="Ex: 12.0-16.0"
                            disabled={isReadOnly}
                          />
                        </div>
                      )}
                    </TableCell>
                    {!isPreviewMode && !isReadOnly && (
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
        <div className="flex items-center justify-between mb-4 no-print">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <span className="font-semibold">Mode Aperçu</span>
          </div>
          <div className="flex items-center gap-2">
            <Label>Édition</Label>
            <Switch
              checked={!isPreviewMode}
              onCheckedChange={(checked) => setIsPreviewMode(!checked)}
              disabled={isReadOnly}
            />
            <Label>Aperçu</Label>
          </div>
        </div>

        {labRequest.exams.map((exam) => (
          <div key={exam.id}>
            {renderExamTable(exam.id, exam.name)}
          </div>
        ))}

        <style>{`
          @media print {
            body { background: white; }
            .no-print { display: none !important; }
          }
        `}</style>
      </div>
    );
  }

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
              <Switch
                checked={!isPreviewMode}
                onCheckedChange={(checked) => setIsPreviewMode(!checked)}
                disabled={isReadOnly}
              />
              <Label>Aperçu</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Résultats des examens demandés
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Pour chaque ligne : saisir la numérotation, le résultat et les valeurs normales.
          </p>
        </CardHeader>
        <CardContent>
          {labRequest.exams.map((exam) => (
            <div key={exam.id} className="mb-8 last:mb-0">
              {renderExamTable(exam.id, exam.name)}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default LabResultsFormComplete;
