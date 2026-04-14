# Martin Tracker

## Pasos para deployar (15 min aprox)

### 1. Crear base de datos en Supabase

1. Entrá a https://supabase.com y creá cuenta (podés usar GitHub)
2. **New project** → nombre libre, contraseña de DB (guardala), región más cercana (São Paulo)
3. Esperá ~2 min a que se cree
4. Menú izquierdo → **SQL Editor** → **New query**
5. Pegá el contenido de `supabase-schema.sql` → **Run**
6. Menú izquierdo → **Project Settings** (tuerca) → **API**
7. Copiá estos dos valores, los vas a necesitar:
   - **Project URL** (algo tipo `https://xxxxx.supabase.co`)
   - **anon public** key (empieza con `eyJ...`)

### 2. Subir a GitHub

1. Creá cuenta en https://github.com si no tenés
2. **New repository** → nombre: `tracker` (privado si querés)
3. En tu terminal, dentro de esta carpeta:
   ```
   git init
   git add .
   git commit -m "initial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/tracker.git
   git push -u origin main
   ```

### 3. Deployar en Vercel

1. Entrá a https://vercel.com y hacé login con GitHub
2. **Add New** → **Project** → elegí el repo `tracker`
3. Antes de deployar, expandí **Environment Variables** y agregá:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu Project URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key de Supabase
4. **Deploy**
5. En ~1 minuto tenés URL tipo `tracker-xyz.vercel.app`

### 4. Listo

Abrí la URL en el teléfono y en la compu. Los datos sincronizan automáticamente entre dispositivos.

## Probar local (opcional)

```
npm install
cp .env.local.example .env.local
# editá .env.local con tus credenciales de Supabase
npm run dev
```

Abrí http://localhost:3000

## Notas de seguridad

La app está abierta (cualquiera con la URL puede cargar datos). Para uso personal está bien. Si querés protegerla con login, avisame y te agrego Supabase Auth.
