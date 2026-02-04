import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AppConfig {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

// Metadata for UI mapping
interface ConfigMetadata {
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  category: 'general' | 'tokens' | 'features' | 'limits' | 'ui' | 'security' | 'notifications';
  label: string;
  isPublic: boolean;
  requiresRestart: boolean;
}

const UI_METADATA: Record<string, ConfigMetadata> = {
  maintenance_mode: { type: 'boolean', category: 'general', label: 'Maintenance Mode', isPublic: true, requiresRestart: false },
  app_name: { type: 'string', category: 'general', label: 'Application Name', isPublic: true, requiresRestart: false },
  love_to_love2_exchange_rate: { type: 'number', category: 'tokens', label: 'Exchange Rate (LOVE to LOVE2)', isPublic: true, requiresRestart: false },
  daily_swap_limit_default: { type: 'number', category: 'limits', label: 'Default Daily Swap Limit', isPublic: false, requiresRestart: false },
  swap_approval_threshold: { type: 'number', category: 'limits', label: 'Swap Approval Threshold', isPublic: false, requiresRestart: false },
  creator_verification_fee: { type: 'number', category: 'tokens', label: 'Creator Verification Fee', isPublic: true, requiresRestart: false },
  referral_bonus: { type: 'number', category: 'tokens', label: 'Referral Bonus', isPublic: true, requiresRestart: false },
  enable_video_calls: { type: 'boolean', category: 'features', label: 'Enable Video Calls', isPublic: true, requiresRestart: true },
};

interface AppConfigPanelProps {
  adminMode?: boolean;
}

export const AppConfigPanel: React.FC<AppConfigPanelProps> = ({
  adminMode = false,
}) => {
  const [configs, setConfigs] = useState<AppConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | ConfigMetadata['category']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'All Settings', icon: '⚙️' },
    { value: 'general', label: 'General', icon: '🌐' },
    { value: 'tokens', label: 'Tokens', icon: '💰' },
    { value: 'features', label: 'Features', icon: '🚀' },
    { value: 'limits', label: 'Limits', icon: '📊' },
    { value: 'ui', label: 'UI/UX', icon: '🎨' },
    { value: 'security', label: 'Security', icon: '🔒' },
    { value: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .order('key');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (key: string, newValue: string) => {
    try {
      setSaving(key);
      const { error } = await supabase
        .from('app_config')
        .update({ value: newValue, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;

      setConfigs(prev => prev.map(c => c.key === key ? { ...c, value: newValue, updated_at: new Date().toISOString() } : c));

      toast({
        title: 'Configuration Updated',
        description: `${key} has been updated`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(null);
    }
  };

  const parseConfigValue = (config: AppConfig) => {
    const meta = UI_METADATA[config.key] || { type: 'string' };
    try {
      switch (meta.type) {
        case 'boolean':
          return config.value.toLowerCase() === 'true';
        case 'number':
          return parseFloat(config.value);
        case 'json':
        case 'array':
          return JSON.parse(config.value);
        default:
          return config.value;
      }
    } catch {
      return config.value;
    }
  };

  const formatConfigValue = (key: string, value: any): string => {
    const meta = UI_METADATA[key] || { type: 'string' };
    switch (meta.type) {
      case 'boolean':
        return value ? 'true' : 'false';
      case 'number':
        return value.toString();
      case 'json':
      case 'array':
        return typeof value === 'string' ? value : JSON.stringify(value);
      default:
        return value.toString();
    }
  };

  const renderConfigInput = (config: AppConfig) => {
    const meta = UI_METADATA[config.key] || { type: 'string' };
    const value = parseConfigValue(config);

    switch (meta.type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={value as boolean}
              onCheckedChange={(checked) => updateConfig(config.key, formatConfigValue(config.key, checked))}
              disabled={saving === config.key || !adminMode}
            />
            <span className="text-sm">{value ? 'Enabled' : 'Disabled'}</span>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value as number}
            onChange={(e) => updateConfig(config.key, e.target.value)}
            disabled={saving === config.key || !adminMode}
            className="max-w-32"
          />
        );

      case 'json':
      case 'array':
        return (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => updateConfig(config.key, e.target.value)}
            disabled={saving === config.key || !adminMode}
            rows={4}
            className="font-mono text-sm"
          />
        );

      default:
        return (
          <Input
            value={value as string}
            onChange={(e) => updateConfig(config.key, e.target.value)}
            disabled={saving === config.key || !adminMode}
          />
        );
    }
  };

  const getTypeBadge = (key: string) => {
    const meta = UI_METADATA[key] || { type: 'string' };
    const typeConfig = {
      string: { color: 'bg-blue-100 text-blue-800', label: 'Text' },
      number: { color: 'bg-green-100 text-green-800', label: 'Number' },
      boolean: { color: 'bg-purple-100 text-purple-800', label: 'Toggle' },
      json: { color: 'bg-orange-100 text-orange-800', label: 'JSON' },
      array: { color: 'bg-pink-100 text-pink-800', label: 'Array' }
    };

    const config = typeConfig[meta.type as keyof typeof typeConfig] || typeConfig.string;
    return (
      <Badge variant="secondary" className={`text-xs ${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  const getCategoryBadge = (key: string) => {
    const meta = UI_METADATA[key] || { category: 'general' };
    const categoryConfig = categories.find(c => c.value === meta.category);
    return (
      <Badge variant="outline" className="text-xs">
        {categoryConfig?.icon} {categoryConfig?.label}
      </Badge>
    );
  };

  const filteredConfigs = configs.filter(config => {
    const meta = UI_METADATA[config.key] || { category: 'general', isPublic: true };
    const matchesCategory = activeCategory === 'all' || meta.category === activeCategory;
    const matchesSearch = config.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (config.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVisibility = adminMode || meta.isPublic;

    return matchesCategory && matchesSearch && matchesVisibility;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">⚙️</span>
            Application Configuration
          </h1>
          <p className="text-muted-foreground">
            Manage application settings and feature flags
          </p>
        </div>

        {adminMode && (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Admin Mode
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category.value}
            variant={activeCategory === category.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(category.value as any)}
            className="flex items-center gap-2"
          >
            <span>{category.icon}</span>
            {category.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search configurations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={fetchConfigs}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredConfigs.map(config => {
          const meta = UI_METADATA[config.key] || {};
          return (
            <Card key={config.key} className="relative">
              {meta.requiresRestart && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs shadow-md">
                  Restart Required
                </Badge>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-mono break-all text-primary/80">
                      {config.key}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 ml-4">
                    {getTypeBadge(config.key)}
                    {getCategoryBadge(config.key)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-muted-foreground">
                    Current Value
                  </label>
                  {renderConfigInput(config)}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                  <div className="flex items-center gap-4">
                    <span>Last Updated:</span>
                    <span className="font-medium text-foreground/70">
                      {new Date(config.updated_at).toLocaleString()}
                    </span>
                  </div>
                  {!meta.isPublic && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      Admin Only
                    </Badge>
                  )}
                </div>

                {saving === config.key && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-20">
                    <div className="flex items-center gap-2 text-blue-600 font-medium">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Saving Changes...
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredConfigs.length === 0 && !loading && (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center text-muted-foreground">
            <div className="text-5xl mb-4 opacity-20">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No configurations found</h3>
            <p>
              {searchQuery || activeCategory !== 'all'
                ? "We couldn't find any settings matching your current filters."
                : "The configuration table appears to be empty."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};