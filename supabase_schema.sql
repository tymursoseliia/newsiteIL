-- Create cars table
CREATE TABLE IF NOT EXISTS public.cars (
    id TEXT PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year TEXT,
    "bodyType" TEXT,
    mileage TEXT,
    engine TEXT,
    hp TEXT,
    transmission TEXT,
    fuel TEXT,
    price TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and add public read policy for cars
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cars" ON public.cars FOR SELECT USING (true);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "carModel" TEXT,
    type TEXT CHECK (type IN ('photo', 'video')),
    text TEXT,
    "mediaUrl" TEXT,
    "videoUrl" TEXT,
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and add public read policy for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);

-- Create managers table
CREATE TABLE IF NOT EXISTS public.managers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    image TEXT,
    telegram TEXT,
    whatsapp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and add public read policy for managers
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to managers" ON public.managers FOR SELECT USING (true);

-- Create callbacks table
CREATE TABLE IF NOT EXISTS public.callbacks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    car TEXT,
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and policies for callbacks
ALTER TABLE public.callbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert access to callbacks" ON public.callbacks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access to callbacks" ON public.callbacks FOR SELECT USING (true);
