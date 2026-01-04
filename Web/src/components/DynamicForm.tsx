import {
  Button,
  Checkbox,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  TimeRangePicker,
} from '@/components';
import { cn } from '@/lib';
import { type FieldType as BaseFieldType } from '@/types';
import { parse } from 'date-fns';
import { Check, ChevronDown, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { TimePicker } from '@/components/ui/timePicker';
import { DateRangePicker } from '@/components/ui/dateRangePicker';

type FieldType = BaseFieldType & {
  fields?: BaseFieldType[];
  minItems?: number;
  maxItems?: number;
  section?: string;
};

type DynamicFormProps = {
  schema: FieldType[];
  onSubmit: (formData: Record<string, any>) => void;
  submitButtonText?: string;
  isSubmitButtonVisible?: boolean;
  onCancel?: () => void;
  defaultValues?: Record<string, any>;
  disabled?: boolean;
  onChange?: (formData: Record<string, any>) => void;
};

function parseTimeRangeString(str: string): { start?: Date; end?: Date } {
  if (!str || typeof str !== 'string') return {};
  const [startStr, endStr] = str.split(' - ');
  if (!startStr || !endStr) return {};
  const today = new Date();
  const parseTime = (s: string) => parse(s, 'hh:mma', today);
  return {
    start: parseTime(startStr.trim()),
    end: parseTime(endStr.trim()),
  };
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  onSubmit,
  onCancel,
  defaultValues,
  submitButtonText = 'Submit',
  isSubmitButtonVisible = true,
  disabled,
  onChange,
}) => {
  const initialFormData = { ...(defaultValues || {}) };
  schema.forEach(field => {
    if (field.type === 'timerange' && initialFormData[field.name] && typeof initialFormData[field.name] === 'string') {
      initialFormData[field.name] = parseTimeRangeString(initialFormData[field.name]);
    }
  });

  const [formData, setFormData] = useState<Record<string, any>>(initialFormData);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  const [arrayFieldData, setArrayFieldData] = useState<Record<string, any[]>>(() => {
    const initial: Record<string, any[]> = {};
    schema.forEach(field => {
      if (field.type === 'array') {
        initial[field.name] =
          defaultValues?.[field.name] && Array.isArray(defaultValues[field.name])
            ? defaultValues[field.name]
            : [field.fields?.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})];
      }
    });
    return initial;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(openDropdowns).forEach(fieldName => {
        if (openDropdowns[fieldName] && dropdownRefs.current[fieldName] && !dropdownRefs.current[fieldName]?.contains(event.target as Node)) {
          setOpenDropdowns(prev => ({ ...prev, [fieldName]: false }));
        }
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdowns]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, type, value, checked, files, multiple, options } = e.target;
    let updatedFormData: Record<string, any>;

    if (type === 'checkbox' && Array.isArray(formData[name])) {
      const updated = checked ? [...formData[name], value] : formData[name].filter((v: string) => v !== value);
      updatedFormData = { ...formData, [name]: updated };
    } else if (type === 'checkbox') {
      updatedFormData = { ...formData, [name]: checked };
    } else if (type === 'file') {
      updatedFormData = { ...formData, [name]: files[0] };
    } else if (multiple) {
      const selectedValues = Array.from(options)
        .filter(option => (option as HTMLOptionElement).selected)
        .map(option => (option as HTMLOptionElement).value);
      updatedFormData = { ...formData, [name]: selectedValues };
    } else {
      updatedFormData = { ...formData, [name]: value };
    }
    setFormData(updatedFormData);
    if (onChange) onChange(updatedFormData);
  };

  const handleMultiSelectToggle = (fieldName: string, optionValue: string) => {
    const currentValues = Array.isArray(formData[fieldName]) ? formData[fieldName] : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v: string) => v !== optionValue)
      : [...currentValues, optionValue];
    setFormData({ ...formData, [fieldName]: newValues });
  };

  const getSelectedLabel = (field: FieldType) => {
    const selectedValues = Array.isArray(formData[field.name]) ? formData[field.name] : [];
    if (selectedValues.length === 0) return 'Select options...';
    if (selectedValues.length === 1) {
      const option = field.options?.find(opt => (typeof opt === 'string' ? opt : opt.value) === selectedValues[0]);
      return typeof option === 'string' ? option : option?.label || selectedValues[0];
    }
    return `${selectedValues.length} options selected`;
  };

  const handleArrayFieldChange = (fieldName: string, idx: number, subField: string, value: any) => {
    setArrayFieldData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => (i === idx ? { ...item, [subField]: value } : item)),
    }));
  };

  const handleAddArrayFieldItem = (fieldName: string, fields: FieldType[]) => {
    setArrayFieldData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})],
    }));
  };

  const handleRemoveArrayFieldItem = (fieldName: string, idx: number) => {
    setArrayFieldData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };
    Object.keys(arrayFieldData).forEach(fieldName => {
      finalData[fieldName] = arrayFieldData[fieldName];
    });
    onSubmit(finalData);
  };

  useEffect(() => {
    if (onChange) {
      const merged = { ...formData };
      Object.keys(arrayFieldData).forEach(fieldName => {
        merged[fieldName] = arrayFieldData[fieldName];
      });
      onChange(merged);
    }
  }, [arrayFieldData]);

  useEffect(() => {
    if (onChange) onChange(defaultValues || {});
  }, []);

  useEffect(() => {
    if (defaultValues) setFormData(defaultValues);
  }, [defaultValues]);

  const sectionMap: Record<string, FieldType[]> = {};
  schema.forEach(field => {
    const section = field.section || 'General';
    if (!sectionMap[section]) sectionMap[section] = [];
    sectionMap[section].push(field);
  });

  const inputBaseClass = "h-11 rounded-xl border-2 border-border bg-card hover:border-primary/30 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200";
  const labelClass = "text-sm font-semibold text-foreground mb-2 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      {Object.entries(sectionMap).map(([section, fields]) => (
        <div key={section} className="space-y-6">
          {section !== 'General' && (
            <div className="pb-2 border-b border-border/50">
              <h3 className="text-lg font-semibold text-foreground">{section}</h3>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(field => (
              <div key={field.name} className={cn(field.columns === 2 && 'md:col-span-2')}>
                <label className={labelClass}>
                  {field.label}
                  {field.required && <span className="ml-1 text-destructive">*</span>}
                </label>

                {field.type === 'array' && field.fields ? (
                  <div className="space-y-3">
                    {arrayFieldData[field.name]?.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center p-3 rounded-xl bg-muted/30 border border-border/30">
                        {field.fields?.map(subField =>
                          subField.type === 'select' ? (
                            <Select
                              key={subField.name}
                              value={item[subField.name] || ''}
                              onValueChange={value => handleArrayFieldChange(field.name, idx, subField.name, value)}
                              disabled={disabled}
                            >
                              <SelectTrigger className={cn(inputBaseClass, "flex-1")}>
                                <SelectValue placeholder={subField.label} />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-2 border-border shadow-lg">
                                {subField.options?.map(opt => {
                                  const optionValue = typeof opt === 'string' ? opt : opt.value;
                                  const optionLabel = typeof opt === 'string' ? opt : opt.label;
                                  return (
                                    <SelectItem key={optionValue} value={String(optionValue)} className="rounded-lg">
                                      {String(optionLabel)}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              key={subField.name}
                              type={subField.type}
                              placeholder={subField.label}
                              className={cn(inputBaseClass, "flex-1")}
                              value={item[subField.name]}
                              onChange={e => handleArrayFieldChange(field.name, idx, subField.name, e.target.value)}
                              required={subField.required}
                              disabled={disabled}
                            />
                          )
                        )}
                        <div className="flex gap-1">
                          {arrayFieldData[field.name].length > (field.minItems || 1) && (
                            <button
                              type="button"
                              onClick={() => handleRemoveArrayFieldItem(field.name, idx)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleAddArrayFieldItem(field.name, field.fields!)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center border border-border/50 hover:bg-accent transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : field.type === 'daterange' ? (
                  <DateRangePicker
                    value={formData[field.name]}
                    onChange={range => {
                      setFormData({ ...formData, [field.name]: range });
                      if (onChange) onChange({ ...formData, [field.name]: range });
                    }}
                  />
                ) : field.type === 'timerange' ? (
                  <TimeRangePicker
                    value={formData[field.name]}
                    onChange={range => setFormData({ ...formData, [field.name]: range })}
                    placeholder="Select time range"
                  />
                ) : field.type === 'time' ? (
                  <TimePicker
                    value={formData[field.name] ? new Date(formData[field.name]) : undefined}
                    onChange={date => {
                      setFormData({ ...formData, [field.name]: date ? date.toISOString() : '' });
                      if (onChange) onChange({ ...formData, [field.name]: date ? date.toISOString() : '' });
                    }}
                  />
                ) : field.type === 'toggle' ? (
                  <div className="flex items-center gap-3 py-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData[field.name]}
                      className={cn(
                        'relative inline-flex items-center h-7 w-12 rounded-full transition-all duration-200 border-2',
                        formData[field.name] ? 'bg-primary border-primary shadow-md shadow-primary/30' : 'bg-muted border-border'
                      )}
                      onClick={() => setFormData({ ...formData, [field.name]: !formData[field.name] })}
                      disabled={disabled || field.disabled}
                    >
                      <span
                        className={cn(
                          'w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200',
                          formData[field.name] ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                    <span className={cn('text-sm font-semibold', formData[field.name] ? 'text-primary' : 'text-muted-foreground')}>
                      {formData[field.name] ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ) : field.type === 'textarea' ? (
                  <Textarea
                    name={field.name}
                    required={field.required}
                    placeholder={field.placeholder}
                    onChange={handleChange}
                    className="min-h-[120px] rounded-xl border-2 border-border bg-card hover:border-primary/30 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200"
                    value={formData[field.name] || ''}
                    disabled={disabled || field.disabled}
                  />
                ) : field.type === 'select' && field.multiSelect ? (
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(inputBaseClass, "w-full justify-between")}
                          disabled={disabled || field.disabled}
                        >
                          <span className={!formData[field.name]?.length ? 'text-muted-foreground' : ''}>
                            {getSelectedLabel(field)}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 rounded-xl border-2 border-border shadow-lg" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                        <div className="max-h-64 overflow-auto">
                          <div className="sticky top-0 p-2 bg-background border-b border-border/50">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="text"
                                className="h-9 pl-8 rounded-lg text-sm"
                                placeholder="Search..."
                                value={searchTerms[field.name] || ''}
                                onChange={e => setSearchTerms(prev => ({ ...prev, [field.name]: e.target.value }))}
                                onClick={e => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div className="p-1">
                            {field.options
                              ?.filter(opt => {
                                const searchTerm = searchTerms[field.name]?.toLowerCase() || '';
                                if (!searchTerm) return true;
                                const optionLabel = typeof opt === 'string' ? opt : opt.label;
                                return String(optionLabel).toLowerCase().includes(searchTerm);
                              })
                              ?.map(opt => {
                                const optionValue = typeof opt === 'string' ? opt : opt.value;
                                const optionLabel = typeof opt === 'string' ? opt : opt.label;
                                const isSelected = Array.isArray(formData[field.name]) && formData[field.name].map(String).includes(String(optionValue));

                                return (
                                  <div
                                    key={optionValue}
                                    className={cn(
                                      'flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors',
                                      isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                                    )}
                                    onClick={() => {
                                      handleMultiSelectToggle(field.name, optionValue);
                                      const updatedFormData = {
                                        ...formData,
                                        [field.name]: Array.isArray(formData[field.name])
                                          ? formData[field.name].includes(optionValue)
                                            ? formData[field.name].filter((v: string) => v !== optionValue)
                                            : [...formData[field.name], optionValue]
                                          : [optionValue],
                                      };
                                      setFormData(updatedFormData);
                                      if (onChange) onChange(updatedFormData);
                                    }}
                                  >
                                    <div className={cn(
                                      'flex h-4 w-4 items-center justify-center rounded border',
                                      isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                                    )}>
                                      {isSelected && <Check className="h-3 w-3" />}
                                    </div>
                                    <span className="text-sm">{String(optionLabel)}</span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {Array.isArray(formData[field.name]) && formData[field.name].length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData[field.name].map((val: string) => {
                          const option = field.options?.find((opt: any) => String(typeof opt === 'string' ? opt : opt.value) === String(val));
                          const label = typeof option === 'string' ? option : option?.label || val;
                          return (
                            <div key={val} className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-sm">
                              <span>{String(label)}</span>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  const updatedFormData = { ...formData, [field.name]: formData[field.name].filter((v: string) => v !== val) };
                                  setFormData(updatedFormData);
                                  if (onChange) onChange(updatedFormData);
                                }}
                                disabled={disabled || field.disabled}
                                className="hover:text-destructive transition-colors"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : field.type === 'select' && !field.multiSelect ? (
                  <Select
                    value={formData[field.name] || ''}
                    onValueChange={value => {
                      const updatedFormData = { ...formData, [field.name]: value };
                      setFormData(updatedFormData);
                      if (onChange) onChange(updatedFormData);
                    }}
                    disabled={disabled || field.disabled}
                  >
                    <SelectTrigger className={cn(inputBaseClass, "w-full")}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-border shadow-lg">
                      {field.options?.map(opt => {
                        const optionValue = typeof opt === 'string' ? opt : opt.value;
                        const optionLabel = typeof opt === 'string' ? opt : opt.label;
                        return (
                          <SelectItem key={optionValue} value={String(optionValue)} className="rounded-lg">
                            {String(optionLabel)}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                ) : field.type === 'radio' ? (
                  <RadioGroup
                    value={formData[field.name] || ''}
                    onValueChange={value => {
                      const updatedFormData = { ...formData, [field.name]: value };
                      setFormData(updatedFormData);
                      if (onChange) onChange(updatedFormData);
                    }}
                    disabled={disabled || field.disabled}
                    className="flex flex-wrap gap-4 pt-1"
                  >
                    {field.options?.map(opt => {
                      const optionValue = typeof opt === 'string' ? opt : opt.value;
                      const optionLabel = typeof opt === 'string' ? opt : opt.label;
                      return (
                        <div key={optionValue} className="flex items-center space-x-2">
                          <RadioGroupItem value={String(optionValue)} id={`${field.name}-${optionValue}`} />
                          <label htmlFor={`${field.name}-${optionValue}`} className="text-sm cursor-pointer">
                            {String(optionLabel)}
                          </label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                ) : field.type === 'checkbox' && field.options ? (
                  <div className="flex flex-wrap gap-4 pt-1">
                    {field.options.map(opt => {
                      const optionValue = typeof opt === 'string' ? opt : opt.value;
                      const optionLabel = typeof opt === 'string' ? opt : opt.label;
                      const isChecked = Array.isArray(formData[field.name]) && formData[field.name].includes(optionValue);
                      return (
                        <div key={optionValue} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${field.name}-${optionValue}`}
                            checked={isChecked}
                            onCheckedChange={checked => {
                              const currentValues = Array.isArray(formData[field.name]) ? formData[field.name] : [];
                              const updatedFormData = {
                                ...formData,
                                [field.name]: checked
                                  ? [...currentValues, optionValue]
                                  : currentValues.filter((val: any) => val !== optionValue),
                              };
                              setFormData(updatedFormData);
                              if (onChange) onChange(updatedFormData);
                            }}
                            disabled={disabled || field.disabled}
                            className="rounded"
                          />
                          <label htmlFor={`${field.name}-${optionValue}`} className="text-sm cursor-pointer">
                            {String(optionLabel)}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ) : field.type === 'chip' ? (
                  <div className="flex flex-wrap gap-2">
                    {field.options?.map(opt => {
                      const optionValue = typeof opt === 'string' ? opt : opt.value;
                      const optionLabel = typeof opt === 'string' ? opt : opt.label;
                      const selected = formData[field.name] === optionValue;
                      return (
                        <button
                          key={optionValue}
                          type="button"
                          className={cn(
                            'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2',
                            selected
                              ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                              : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                          )}
                          onClick={() => {
                            const updatedFormData = { ...formData, [field.name]: optionValue };
                            setFormData(updatedFormData);
                            if (onChange) onChange(updatedFormData);
                          }}
                          disabled={disabled || field.disabled}
                        >
                          {String(optionLabel)}
                        </button>
                      );
                    })}
                  </div>
                ) : field.type === 'color' ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name={field.name}
                      required={field.required}
                      onChange={handleChange}
                      className="w-12 h-12 p-1 rounded-xl border border-border/50 cursor-pointer bg-background"
                      value={formData[field.name] ?? field.defaultValue ?? '#3788d8'}
                      disabled={disabled || field.disabled}
                    />
                    <Input
                      type="text"
                      value={formData[field.name] ?? '#3788d8'}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      className={cn(inputBaseClass, "w-32 font-mono text-sm")}
                      disabled={disabled || field.disabled}
                    />
                  </div>
                ) : (
                  <Input
                    type={field.type}
                    name={field.name}
                    required={field.required}
                    placeholder={field.placeholder}
                    onChange={handleChange}
                    className={cn(inputBaseClass, "w-full")}
                    value={formData[field.name] ?? ''}
                    disabled={disabled || field.disabled}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-6 h-11 rounded-xl border-2 border-border hover:border-primary/30 font-semibold transition-all duration-200"
            disabled={disabled}
          >
            Cancel
          </Button>
        )}
        {isSubmitButtonVisible && (
          <Button
            type="submit"
            className="px-6 h-11 rounded-xl bg-primary hover:bg-primary/90 font-semibold shadow-md shadow-primary/20 transition-all duration-200"
            disabled={disabled}
          >
            {submitButtonText}
          </Button>
        )}
      </div>
    </form>
  );
};
