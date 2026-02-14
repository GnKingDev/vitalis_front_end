import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, AlertTriangle, TrendingDown } from 'lucide-react';
import type { Patient, LabRequest, User, Consultation, DetailedLabResult, ResultAlert } from '@/types';

interface LabResultsPrintProps {
  patient: Patient;
  labRequest: LabRequest;
  doctor: User | null;
  results: DetailedLabResult | null;
  consultation: Consultation | null;
}

const LabResultsPrint: React.FC<LabResultsPrintProps> = ({
  patient,
  labRequest,
  doctor,
  results,
  consultation,
}) => {
  const getAlertBadge = (alert?: ResultAlert) => {
    if (!alert) return null;
    switch (alert) {
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 text-info text-xs">
            <TrendingDown className="h-3 w-3" />
            Bas
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-destructive text-xs">
            <AlertTriangle className="h-3 w-3" />
            Élevé
          </span>
        );
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 text-success text-xs">
            <CheckCircle2 className="h-3 w-3" />
            Normal
          </span>
        );
    }
  };

  return (
    <div className="print:bg-white print:p-8">
      <Card className="print:border-none print:shadow-none">
        <CardContent className="p-8 print:p-0">
          {/* Results Tables */}
          {results && results.sections.length > 0 ? (
            <div className="space-y-6 print:space-y-4 mb-8 print:mb-6">
              {results.sections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-lg font-semibold mb-3 print:text-base print:mb-2">
                    {section.sectionName}
                  </h3>
                  <div className="border rounded-lg overflow-hidden print:border-gray-300">
                    <Table>
                      <TableHeader>
                        <TableRow className="print:border-gray-300">
                          <TableHead className="print:bg-gray-50 print:font-semibold">
                            Paramètre
                          </TableHead>
                          <TableHead className="print:bg-gray-50 print:font-semibold">
                            Résultat
                          </TableHead>
                          <TableHead className="print:bg-gray-50 print:font-semibold">
                            Unités
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.parameters
                          .filter((param) => param.value) // Only show filled parameters
                          .map((param) => (
                            <TableRow key={param.id} className="print:border-gray-300">
                              <TableCell className="font-medium print:py-2">
                                {param.parameterName}
                              </TableCell>
                              <TableCell className="print:py-2">{param.value}</TableCell>
                              <TableCell className="text-sm text-muted-foreground print:py-2">
                                {param.unit}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Print Styles */}
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
};

export default LabResultsPrint;
