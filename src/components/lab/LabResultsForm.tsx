import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FlaskConical, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';
import type { LabExam, DetailedLabResult, LabResultSection, LabResultParameter, ResultAlert } from '@/types';

interface LabResultsFormProps {
  labRequestId: string;
  exams: LabExam[];
  onResultsChange: (results: DetailedLabResult | null) => void;
}

// Reference ranges for common parameters
const referenceRanges: Record<string, { range: string; unit: string; gender?: 'M' | 'F' }> = {
  // Hémogramme
  'GR': { range: '4.5-5.5', unit: '10⁶/mm³', gender: 'M' },
  'GR_F': { range: '4.0-5.0', unit: '10⁶/mm³', gender: 'F' },
  'Hb': { range: '13.0-17.0', unit: 'g/dL', gender: 'M' },
  'Hb_F': { range: '12.0-16.0', unit: 'g/dL', gender: 'F' },
  'Hct': { range: '40-50', unit: '%', gender: 'M' },
  'Hct_F': { range: '36-46', unit: '%', gender: 'F' },
  'VGM': { range: '80-100', unit: 'fL' },
  'TGMH': { range: '27-31', unit: 'pg' },
  'CGMH': { range: '32-36', unit: 'g/dL' },
  'Plaquettes': { range: '150000-400000', unit: '/mm³' },
  
  // Globules blancs
  'Leucocytes': { range: '4000-10000', unit: '/mm³' },
  'Neutrophiles': { range: '2000-7000', unit: '/mm³' },
  'Lymphocytes': { range: '1000-4000', unit: '/mm³' },
  'Monocytes': { range: '200-1000', unit: '/mm³' },
  'Éosinophiles': { range: '50-500', unit: '/mm³' },
  'Basophiles': { range: '0-100', unit: '/mm³' },
  
  // Biochimie
  'Albumine': { range: '35-50', unit: 'g/L' },
  'ALT': { range: '7-56', unit: 'U/L', gender: 'M' },
  'ALT_F': { range: '7-30', unit: 'U/L', gender: 'F' },
  'AST': { range: '10-40', unit: 'U/L', gender: 'M' },
  'AST_F': { range: '9-32', unit: 'U/L', gender: 'F' },
  'Créatinine': { range: '0.7-1.2', unit: 'mg/dL', gender: 'M' },
  'Créatinine_F': { range: '0.5-1.0', unit: 'mg/dL', gender: 'F' },
  'Urée': { range: '15-50', unit: 'mg/dL' },
  'Glycémie': { range: '70-100', unit: 'mg/dL' },
  'Cholestérol total': { range: '<200', unit: 'mg/dL' },
  'HDL': { range: '>40', unit: 'mg/dL', gender: 'M' },
  'HDL_F': { range: '>50', unit: 'mg/dL', gender: 'F' },
  'LDL': { range: '<100', unit: 'mg/dL' },
  'Triglycérides': { range: '<150', unit: 'mg/dL' },
};

// Sections structure based on exam type
const getSectionsForExam = (examName: string): LabResultSection[] => {
  const examLower = examName.toLowerCase();
  
  if (examLower.includes('nfs') || examLower.includes('hémogramme')) {
    return [
      {
        id: 'hemogram',
        sectionName: 'Hémogramme',
        parameters: [
          { id: 'gr', parameterName: 'GR (Globules rouges)', value: '', unit: '10⁶/mm³', referenceRange: '4.5-5.5', alert: undefined },
          { id: 'hb', parameterName: 'Hb (Hémoglobine)', value: '', unit: 'g/dL', referenceRange: '12.0-16.0', alert: undefined },
          { id: 'hct', parameterName: 'Hct (Hématocrite)', value: '', unit: '%', referenceRange: '40-50', alert: undefined },
          { id: 'vgm', parameterName: 'VGM (Volume globulaire moyen)', value: '', unit: 'fL', referenceRange: '80-100', alert: undefined },
          { id: 'tgmh', parameterName: 'TGMH (Teneur globulaire moyenne en Hb)', value: '', unit: 'pg', referenceRange: '27-31', alert: undefined },
          { id: 'cgmh', parameterName: 'CGMH (Concentration globulaire moyenne en Hb)', value: '', unit: 'g/dL', referenceRange: '32-36', alert: undefined },
          { id: 'plaquettes', parameterName: 'Plaquettes', value: '', unit: '/mm³', referenceRange: '150000-400000', alert: undefined },
        ],
      },
      {
        id: 'leukocytes',
        sectionName: 'Globules blancs et différentiel',
        parameters: [
          { id: 'leucocytes', parameterName: 'Leucocytes (GB)', value: '', unit: '/mm³', referenceRange: '4000-10000', alert: undefined },
          { id: 'neutrophiles', parameterName: 'Neutrophiles', value: '', unit: '/mm³', referenceRange: '2000-7000', alert: undefined },
          { id: 'lymphocytes', parameterName: 'Lymphocytes', value: '', unit: '/mm³', referenceRange: '1000-4000', alert: undefined },
          { id: 'monocytes', parameterName: 'Monocytes', value: '', unit: '/mm³', referenceRange: '200-1000', alert: undefined },
          { id: 'eosinophiles', parameterName: 'Éosinophiles', value: '', unit: '/mm³', referenceRange: '50-500', alert: undefined },
          { id: 'basophiles', parameterName: 'Basophiles', value: '', unit: '/mm³', referenceRange: '0-100', alert: undefined },
        ],
      },
    ];
  }
  
  if (examLower.includes('biochimie') || examLower.includes('bilan')) {
    return [
      {
        id: 'biochemistry',
        sectionName: 'Principaux constituants',
        parameters: [
          { id: 'albumine', parameterName: 'Albumine', value: '', unit: 'g/L', referenceRange: '35-50', alert: undefined },
          { id: 'alt', parameterName: 'ALT (ALAT)', value: '', unit: 'U/L', referenceRange: '7-56', alert: undefined },
          { id: 'ast', parameterName: 'AST (ASAT)', value: '', unit: 'U/L', referenceRange: '10-40', alert: undefined },
          { id: 'creatinine', parameterName: 'Créatinine', value: '', unit: 'mg/dL', referenceRange: '0.7-1.2', alert: undefined },
          { id: 'uree', parameterName: 'Urée', value: '', unit: 'mg/dL', referenceRange: '15-50', alert: undefined },
          { id: 'glycemie', parameterName: 'Glycémie', value: '', unit: 'mg/dL', referenceRange: '70-100', alert: undefined },
        ],
      },
    ];
  }
  
  // Default section for other exams
  return [
    {
      id: 'default',
      sectionName: 'Résultats',
      parameters: [
        { id: 'result', parameterName: 'Résultat', value: '', unit: '', referenceRange: '', alert: undefined },
      ],
    },
  ];
};

const LabResultsForm: React.FC<LabResultsFormProps> = ({ labRequestId, exams, onResultsChange }) => {
  const [sections, setSections] = useState<LabResultSection[]>(() => {
    // Initialize sections based on first exam (or combine all)
    if (exams.length > 0) {
      return getSectionsForExam(exams[0].name);
    }
    return [];
  });

  const [technicianNotes, setTechnicianNotes] = useState('');

  // Calculate alert based on value and reference range
  const calculateAlert = (value: string, referenceRange: string): ResultAlert | undefined => {
    if (!value || !referenceRange) return undefined;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return undefined;

    // Parse reference range (e.g., "12.0-16.0" or "<200")
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

  const updateParameter = (sectionId: string, paramId: string, value: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            parameters: section.parameters.map((param) => {
              if (param.id === paramId) {
                const alert = calculateAlert(value, param.referenceRange);
                return { ...param, value, alert };
              }
              return param;
            }),
          };
        }
        return section;
      })
    );
  };

  // Update parent component when sections change
  React.useEffect(() => {
    const detailedResult: DetailedLabResult = {
      id: `result-${labRequestId}`,
      labRequestId,
      examId: exams[0]?.id || '',
      examName: exams.map((e) => e.name).join(', '),
      sections,
      status: 'draft',
      completedAt: new Date().toISOString(),
    };
    onResultsChange(detailedResult);
  }, [sections, labRequestId, exams, onResultsChange]);

  const getAlertIcon = (alert?: ResultAlert) => {
    if (!alert) return null;
    switch (alert) {
      case 'low':
        return <TrendingDown className="h-4 w-4 text-info" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'normal':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
  };

  const getAlertBadge = (alert?: ResultAlert) => {
    if (!alert) return null;
    switch (alert) {
      case 'low':
        return <Badge variant="outline" className="bg-info/10 text-info border-info">Bas</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">Élevé</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-success/10 text-success border-success">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Saisie des résultats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label className="text-sm font-medium">Examens demandés</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {exams.map((exam) => (
                <Badge key={exam.id} variant="outline">
                  {exam.name}
                </Badge>
              ))}
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.id} className="mb-6">
              <h3 className="text-lg font-semibold mb-4">{section.sectionName}</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Paramètre</TableHead>
                      <TableHead className="w-[150px]">Résultat</TableHead>
                      <TableHead className="w-[100px]">Unités</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.parameters.map((param) => (
                      <TableRow key={param.id}>
                        <TableCell className="font-medium">{param.parameterName}</TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={param.value}
                            onChange={(e) => updateParameter(section.id, param.id, e.target.value)}
                            placeholder="Saisir valeur"
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {param.unit}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}

          <div className="mt-6">
            <Label>Notes du technicien (optionnel)</Label>
            <Textarea
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
              placeholder="Ajouter des notes ou observations..."
              rows={3}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabResultsForm;
