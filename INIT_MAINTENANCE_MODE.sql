INSERT INTO public.app_config (key, value, description)
VALUES ('maintenance_mode', 'false', 'App-wide maintenance mode toggle')
ON CONFLICT (key) DO UPDATE SET description = EXCLUDED.description;
