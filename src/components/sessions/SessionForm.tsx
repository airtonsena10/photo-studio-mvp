import React, { useState, useEffect } from 'react';
import { Check, X, Calendar, Clock, MapPin, DollarSign, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Client, Session, SessionFormData, SessionType } from '@/types';
import { formatCurrency } from '@/utils';

interface SessionFormProps {
  clients: Client[];
  session?: Session | null;
  onSave: (data: SessionFormData) => void;
  onCancel: () => void;
}

interface SessionFormErrors {
  clientId?: string;
  type?: string;
  date?: string;
  time?: string;
  duration?: string;
  location?: string;
  value?: string;
  notes?: string;
}

const sessionTypes: Array<{ value: SessionType; label: string; icon: string }> = [
  { value: 'newborn', label: 'Newborn', icon: '👶' },
  { value: 'gestante', label: 'Gestante', icon: '🤱' },
  { value: 'casamento', label: 'Casamento', icon: '💒' },
  { value: 'corporativo', label: 'Corporativo', icon: '💼' },
  { value: 'familia', label: 'Família', icon: '👨‍👩‍👧‍👦' },
  { value: 'evento', label: 'Evento', icon: '🎉' },
  { value: 'produto', label: 'Produto', icon: '📦' }
];

const SessionForm: React.FC<SessionFormProps> = ({ clients, session, onSave, onCancel }) => {
  const [formData, setFormData] = useState<SessionFormData>({
    clientId: '',
    type: '',
    date: '',
    time: '',
    duration: 2,
    location: '',
    value: 0,
    notes: ''
  });

  const [errors, setErrors] = useState<SessionFormErrors>({});
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Preencher formulário para edição
  useEffect(() => {
    if (session) {
      setFormData({
        clientId: session.clientId,
        type: session.type,
        date: session.date,
        time: session.time,
        duration: session.duration,
        location: session.location,
        value: session.value,
        notes: session.notes || ''
      });

      const client = clients.find(c => c.id === session.clientId);
      setSelectedClient(client || null);
    }
  }, [session, clients]);

  // Atualizar cliente selecionado
  useEffect(() => {
    if (formData.clientId) {
      const client = clients.find(c => c.id === formData.clientId);
      setSelectedClient(client || null);
    }
  }, [formData.clientId, clients]);

  const validateForm = (): boolean => {
    const newErrors: SessionFormErrors = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Cliente é obrigatório';
    }

    if (!formData.type) {
      newErrors.type = 'Tipo de sessão é obrigatório';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Data não pode ser no passado';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Horário é obrigatório';
    }

    if (formData.duration < 1 || formData.duration > 12) {
      newErrors.duration = 'Duração deve ser entre 1 e 12 horas';
    }

    if (formData.value < 0) {
      newErrors.value = 'Valor não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof SessionFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Sugestões de valores baseadas no tipo
  const getValueSuggestions = (type: SessionType): number[] => {
    const suggestions: Record<SessionType, number[]> = {
      newborn: [800, 1200, 1500],
      gestante: [600, 800, 1000],
      casamento: [2000, 3000, 5000],
      corporativo: [500, 800, 1200],
      familia: [400, 600, 800],
      evento: [800, 1200, 1800],
      produto: [300, 500, 800]
    };
    
    return suggestions[type] || [500, 800, 1200];
  };

  const selectedTypeInfo = sessionTypes.find(t => t.value === formData.type);
  const valueSuggestions = formData.type ? getValueSuggestions(formData.type as SessionType) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {session ? 'Editar Sessão' : 'Nova Sessão Fotográfica'}
        </CardTitle>
        <CardDescription>
          {session 
            ? 'Atualize as informações da sessão'
            : 'Agende uma nova sessão fotográfica'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select 
              value={formData.clientId} 
              onValueChange={(value) => handleInputChange('clientId', value)}
            >
              <SelectTrigger className={errors.clientId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">{client.email}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && <p className="form-error">{errors.clientId}</p>}
            
            {selectedClient && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                <strong>Contato:</strong> {selectedClient.phone} | {selectedClient.email}
              </div>
            )}
          </div>

          {/* Tipo de Sessão */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Sessão *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o tipo de sessão" />
              </SelectTrigger>
              <SelectContent>
                {sessionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="form-error">{errors.type}</p>}
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={errors.date ? 'border-red-500' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <p className="form-error">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={errors.time ? 'border-red-500' : ''}
              />
              {errors.time && <p className="form-error">{errors.time}</p>}
            </div>
          </div>

          {/* Duração e Local */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (horas)</Label>
              <Select 
                value={formData.duration.toString()} 
                onValueChange={(value) => handleInputChange('duration', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(hour => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {hour}h
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.duration && <p className="form-error">{errors.duration}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Local
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Estúdio, externa, casa do cliente..."
              />
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="value" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valor da Sessão (R$)
            </Label>
            <div className="space-y-2">
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                value={formData.value}
                onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className={errors.value ? 'border-red-500' : ''}
              />
              
              {valueSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Sugestões:</span>
                  {valueSuggestions.map(suggestion => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange('value', suggestion)}
                      className="text-xs"
                    >
                      {formatCurrency(suggestion)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {errors.value && <p className="form-error">{errors.value}</p>}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Observações adicionais sobre a sessão..."
              rows={3}
            />
          </div>

          {/* Resumo da Sessão */}
          {selectedTypeInfo && formData.clientId && formData.date && formData.time && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Resumo da Sessão</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cliente:</span> {selectedClient?.name}
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span> {selectedTypeInfo.icon} {selectedTypeInfo.label}
                </div>
                <div>
                  <span className="text-muted-foreground">Data/Hora:</span> {new Date(formData.date).toLocaleDateString('pt-BR')} às {formData.time}
                </div>
                <div>
                  <span className="text-muted-foreground">Duração:</span> {formData.duration}h
                </div>
                <div>
                  <span className="text-muted-foreground">Valor:</span> {formatCurrency(formData.value)}
                </div>
                <div>
                  <span className="text-muted-foreground">Local:</span> {formData.location || 'Não especificado'}
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {session ? 'Atualizar Sessão' : 'Agendar Sessão'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SessionForm;