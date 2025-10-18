import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  FileText, 
  Download, 
  Upload, 
  Filter,
  Plus,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formRegistry, getFormsByCategory, FormCategory, FormDefinition } from '@/lib/formRegistry';

interface FormDashboardProps {
  onSelectForm: (formId: string) => void;
  formStats?: {
    total: number;
    completed: number;
    draft: number;
    efiled: number;
  };
}

export function FormDashboard({ onSelectForm, formStats }: FormDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FormCategory | 'all'>('all');

  const stats = formStats || {
    total: 0,
    completed: 0,
    draft: 0,
    efiled: 0
  };

  const categories: { value: FormCategory | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Forms', icon: '📋' },
    { value: 'employment', label: 'Employment', icon: '💼' },
    { value: 'authorization', label: 'Authorization', icon: '⚖️' },
    { value: 'business', label: 'Business', icon: '🏢' },
  ];

  const filteredForms = Object.values(formRegistry).filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         form.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || form.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            W-Forms Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage all your W-series tax forms</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Forms</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">E-Filed</p>
                <p className="text-3xl font-bold text-purple-600">{stats.efiled}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search forms by name, type, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.value)}
                  className="whitespace-nowrap gap-2"
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForms.map((form) => (
          <Card 
            key={form.id}
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border border-gray-200 hover:border-gray-300"
            onClick={() => onSelectForm(form.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {form.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold text-gray-900 mb-1">
                    {form.id}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {form.title}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {form.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
                  {form.fields.length} fields
                </Badge>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectForm(form.id);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create
                </Button>
              </div>
              {form.irsPublication && (
                <a 
                  href={form.irsPublication}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-3 inline-block"
                  onClick={(e) => e.stopPropagation()}
                >
                  View IRS Publication →
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No forms found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
