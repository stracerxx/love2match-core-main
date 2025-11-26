import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { useAuth } from '../hooks/useAuth';

interface AppConfig {
  id: string;
  config_key: string;
  config_value: string;
  config_type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description: string;
  category: 'general' | 'tokens' | 'features' | 'limits' | 'ui' | 'security' | 'notifications';
  is_public: boolean;
  requires_restart: boolean;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

interface AppConfigPanelProps {
  adminMode?: boolean;
  onConfigUpdate?: (config: AppConfig) => void;
}

export const AppConfigPanel: React.FC<AppConfigPanelProps> = ({
  adminMode = false,
  onConfigUpdate
}) => {
  const [configs, setConfigs] = useState<AppConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | AppConfig['category']>('all');
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
      // Mock data - replace with actual API call
      const mockConfigs: AppConfig[] = [
        {
          id: '1',
          config_key: 'app_name',
          config_value: 'Love2Match',
          config_type: 'string',
          description: 'Application display name',
          category: 'general',
          is_public: true,
          requires_restart: false,
          updated_by: 'system',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          config_key: 'token_reward_rate',
          config_value: '10',
          config_type: 'number',
          description: 'LOVE tokens earned per profile completion',
          category: 'tokens',
          is_public: true,
          requires_restart: false,
          updated_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          config_key: 'enable_video_calls',
          config_value: 'true',
          config_type: 'boolean',
          description: 'Enable video calling feature',
          category: 'features',
          is_public: true,
          requires_restart: true,
          updated_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          config_key: 'max_daily_messages',
          config_value: '50',
          config_type: 'number',
          description: 'Maximum messages a user can send per day',
          category: 'limits',
          is_public: false,
          requires_restart: false,
          updated_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          config_key: 'theme_colors',
          config_value: '{"primary":"#ec4899","secondary":"#f472b6","accent":"#f9a8d4"}',
          config_type: 'json',
          description: 'Application color theme',
          category: 'ui',
          is_public: true,
          requires_restart: true,
          updated_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '6',
          config_key: 'password_min_length',
          config_value: '8',
          config_type: 'number',
          description: 'Minimum password length requirement',
          category: 'security',
          is_public: false,
          requires_restart: false,
          updated_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '7',
          config_key: 'push_notifications_enabled',
          config_value: 'true',
          config_type: 'boolean',
          description: 'Enable push notifications',
          category: 'notifications',
          is_public: true,
          requires_restart: false,
          updated_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '8',
          config_key: 'feature_flags',
          config_value: '["gift_shop","content_marketplace","video_calls","token_swap"]',
          config_type: 'array',
          description: 'Active feature flags',
          category: 'features',
          is_public: false,
          requires_restart: true,
          updated_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setConfigs(mockConfigs);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (configId: string, newValue: string) => {
    try {
      setSaving(configId);
      
      // Mock API call - replace with actual implementation
      const updatedConfig = configs.find(c => c.id === configId);
      if (!updatedConfig) return;

      const updated: AppConfig = {
        ...updatedConfig,
        config_value: newValue,
        updated_by: user?.email || 'unknown',
        updated_at: new Date().toISOString()
      };

      setConfigs(prev => prev.map(c => c.id === configId ? updated : c));
      
      toast({
        title: 'Configuration Updated',
        description: `${updatedConfig.config_key} has been updated`,
      });

      onConfigUpdate?.(updated);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(null);
    }
  };

  const parseConfigValue = (config: AppConfig) => {
    try {
      switch (config.config_type) {
        case 'boolean':
          return config.config_value.toLowerCase() === 'true';
        case 'number':
          return parseFloat(config.config_value);
        case 'json':
          return JSON.parse(config.config_value);
        case 'array':
          return JSON.parse(config.config_value);
        default:
          return config.config_value;
      }
    } catch {
      return config.config_value;
    }
  };

  const formatConfigValue = (config: AppConfig, value: any) => {
    switch (config.config_type) {
      case 'boolean':
        return value ? 'true' : 'false';
      case 'number':
        return value.toString();
      case 'json':
        return JSON.stringify(value, null, 2);
      case 'array':
        return JSON.stringify(value);
      default:
        return value;
    }
  };

  const renderConfigInput = (config: AppConfig) => {
    const value = parseConfigValue(config);
    
    switch (config.config_type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={value as boolean}
              onCheckedChange={(checked) => updateConfig(config.id, formatConfigValue(config, checked))}
              disabled={saving === config.id || !adminMode}
            />
            <span className="text-sm">{value ? 'Enabled' : 'Disabled'}</span>
          </div>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value as number}
            onChange={(e) => updateConfig(config.id, e.target.value)}
            disabled={saving === config.id || !adminMode}
            className="max-w-32"
          />
        );
      
      case 'json':
        return (
          <Textarea
            value={value as string}
            onChange={(e) => updateConfig(config.id, e.target.value)}
            disabled={saving === config.id || !adminMode}
            rows={4}
            className="font-mono text-sm"
          />
        );
      
      case 'array':
        return (
          <Textarea
            value={value as string}
            onChange={(e) => updateConfig(config.id, e.target.value)}
            disabled={saving === config.id || !adminMode}
            rows={3}
            className="font-mono text-sm"
          />
        );
      
      default:
        return (
          <Input
            value={value as string}
            onChange={(e) => updateConfig(config.id, e.target.value)}
            disabled={saving === config.id || !adminMode}
          />
        );
    }
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      string: { color: 'bg-blue-100 text-blue-800', label: 'Text' },
      number: { color: 'bg-green-100 text-green-800', label: 'Number' },
      boolean: { color: 'bg-purple-100 text-purple-800', label: 'Toggle' },
      json: { color: 'bg-orange-100 text-orange-800', label: 'JSON' },
      array: { color: 'bg-pink-100 text-pink-800', label: 'Array' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.string;
    return (
      <Badge variant="secondary" className={`text-xs ${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = categories.find(c => c.value === category);
    return (
      <Badge variant="outline" className="text-xs">
        {categoryConfig?.icon} {categoryConfig?.label}
      </Badge>
    );
  };

  const filteredConfigs = configs.filter(config => {
    const matchesCategory = activeCategory === 'all' || config.category === activeCategory;
    const matchesSearch = config.config_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = adminMode || config.is_public;
    
    return matchesCategory && matchesSearch && matchesVisibility;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Categories */}
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

      {/* Search */}
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

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredConfigs.map(config => (
          <Card key={config.id} className="relative">
            {config.requires_restart && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                Restart Required
              </Badge>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-mono break-all">
                    {config.config_key}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {config.description}
                  </p>
                </div>
                <div className="flex flex-col gap-1 ml-4">
                  {getTypeBadge(config.config_type)}
                  {getCategoryBadge(config.category)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Current Value Display */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Current Value
                </label>
                {renderConfigInput(config)}
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Updated by: {config.updated_by}</span>
                  <span>•</span>
                  <span>
                    {new Date(config.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {!config.is_public && (
                  <Badge variant="outline" className="text-xs">
                    Admin Only
                  </Badge>
                )}
              </div>

              {/* Saving Indicator */}
              {saving === config.id && (
                <div className="text-sm text-blue-600 animate-pulse">
                  Saving...
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredConfigs.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">No configurations found</h3>
            <p className="text-muted-foreground">
              {searchQuery || activeCategory !== 'all'
                ? "No configurations match your filters."
                : "No configurations available."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
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