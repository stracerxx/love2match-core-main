import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TokenFaucet = () => {
  const [loading, setLoading] = useState(false);

  const handleDistribute = async () => {
    setLoading(true);
    try {
      // 1. Check last distribution time (24h rate limit)
      const { data: config } = await supabase
        .from('admin_config')
        .select('last_faucet_run')
        .single();
      
      const lastRun = new Date(config?.last_faucet_run || 0);
      const now = new Date();
      const diffHours = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);

      if (diffHours < 24) {
        toast.error("COOLDOWN::ACTIVE. Faucet locked for 24h.");
        setLoading(false);
        return;
      }

      // 2. Proceed with distribution
      const { error } = await supabase.rpc('distribute_faucet_tokens');
      if (error) throw error;
      
      toast.success("DISPATCH::TOKENS_SENT");
    } catch (err) {
      toast.error("EXECUTION::FAILED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="gx-btn" onClick={handleDistribute} disabled={loading}>
      {loading ? 'TRANSMITTING...' : 'DISTRIBUTE DAILY FAUCET'}
    </button>
  );
};

export default TokenFaucet;