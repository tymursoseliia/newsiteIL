const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = 'admin123';
const ADMIN_TOKEN = 'secret_admin_token_9823472';

// Config Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bjberojkphzoebrrjssc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_yUWheIGkENHRyXWziM3uAQ_WYECTSe9';

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Supabase client successfully configured');
}

// Ensure database and uploads folders exist
const dbFolder = path.join(__dirname, 'database');
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder);
}
const uploadsFolder = path.join(__dirname, 'rang-auto.ru', 'uploads');
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}

const carsFile = path.join(dbFolder, 'cars.json');
const reviewsFile = path.join(dbFolder, 'reviews.json');
const managersFile = path.join(dbFolder, 'managers.json');

// Initialize database files if they don't exist
if (!fs.existsSync(carsFile)) {
  fs.writeFileSync(carsFile, JSON.stringify([], null, 2), 'utf-8');
}
if (!fs.existsSync(reviewsFile)) {
  fs.writeFileSync(reviewsFile, JSON.stringify([], null, 2), 'utf-8');
}
if (!fs.existsSync(managersFile)) {
  fs.writeFileSync(managersFile, JSON.stringify([], null, 2), 'utf-8');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files of the website
app.use(express.static(path.join(__dirname, 'rang-auto.ru')));

// Custom Page Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'rang-auto.ru', 'index.html'));
});
app.get('/catalog', (req, res) => {
  res.sendFile(path.join(__dirname, 'rang-auto.ru', 'catalog.html'));
});
app.get('/reviews', (req, res) => {
  res.sendFile(path.join(__dirname, 'rang-auto.ru', 'reviews.html'));
});
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'rang-auto.ru', 'about.html'));
});
app.get('/contacts', (req, res) => {
  res.sendFile(path.join(__dirname, 'rang-auto.ru', 'contacts.html'));
});
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'rang-auto.ru', 'privacy.html'));
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'upload-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// Helper functions to read/write database files
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

// Admin authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader === `Bearer ${ADMIN_TOKEN}`) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// --- AUTH API ---
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: 'Неверный пароль!' });
  }
});

// --- CARS API ---

// Get all cars
app.get('/api/cars', async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
    if (!error) {
      return res.json(data);
    }
    console.error('Supabase error fetching cars:', error.message);
  }
  const cars = readData(carsFile);
  res.json(cars);
});

// Add new car
app.post('/api/cars', authenticate, async (req, res) => {
  const newCar = {
    id: Date.now().toString(),
    ...req.body
  };
  if (supabase) {
    const { error } = await supabase.from('cars').insert(newCar);
    if (!error) {
      return res.status(201).json(newCar);
    }
    console.error('Supabase error inserting car:', error.message);
  }
  const cars = readData(carsFile);
  cars.push(newCar);
  writeData(carsFile, cars);
  res.status(201).json(newCar);
});

// Edit car
app.put('/api/cars/:id', authenticate, async (req, res) => {
  const carId = req.params.id;
  if (supabase) {
    const { data, error } = await supabase.from('cars').update(req.body).eq('id', carId).select();
    if (!error && data && data.length > 0) {
      return res.json(data[0]);
    }
    console.error('Supabase error updating car:', error ? error.message : 'No data returned');
  }
  const cars = readData(carsFile);
  const index = cars.findIndex(c => c.id === carId);
  if (index !== -1) {
    cars[index] = { ...cars[index], ...req.body };
    writeData(carsFile, cars);
    res.json(cars[index]);
  } else {
    res.status(404).json({ error: 'Car not found' });
  }
});

// Delete car
app.delete('/api/cars/:id', authenticate, async (req, res) => {
  const carId = req.params.id;
  let carToDelete = null;

  if (supabase) {
    // Fetch car details to delete image
    const { data } = await supabase.from('cars').select('image').eq('id', carId).maybeSingle();
    carToDelete = data;

    const { error } = await supabase.from('cars').delete().eq('id', carId);
    if (!error) {
      if (carToDelete && carToDelete.image && carToDelete.image.includes('/uploads/')) {
        const filename = carToDelete.image.split('/uploads/')[1];
        const filePath = path.join(uploadsFolder, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.json({ message: 'Car deleted' });
    }
    console.error('Supabase error deleting car:', error.message);
  }

  let cars = readData(carsFile);
  const index = cars.findIndex(c => c.id === carId);
  if (index !== -1) {
    const carImage = cars[index].image;
    if (carImage && carImage.includes('/uploads/')) {
      const filename = carImage.split('/uploads/')[1];
      const filePath = path.join(uploadsFolder, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    cars.splice(index, 1);
    writeData(carsFile, cars);
    res.json({ message: 'Car deleted' });
  } else {
    res.status(404).json({ error: 'Car not found' });
  }
});

// --- REVIEWS API ---

// Get all reviews
app.get('/api/reviews', async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (!error) {
      return res.json(data);
    }
    console.error('Supabase error fetching reviews:', error.message);
  }
  const reviews = readData(reviewsFile);
  res.json(reviews);
});

// Add new review
app.post('/api/reviews', authenticate, async (req, res) => {
  const newReview = {
    id: Date.now().toString(),
    date: new Date().toLocaleDateString('ru-RU'),
    ...req.body
  };
  if (supabase) {
    const { error } = await supabase.from('reviews').insert(newReview);
    if (!error) {
      return res.status(201).json(newReview);
    }
    console.error('Supabase error inserting review:', error.message);
  }
  const reviews = readData(reviewsFile);
  reviews.push(newReview);
  writeData(reviewsFile, reviews);
  res.status(201).json(newReview);
});

// Edit review
app.put('/api/reviews/:id', authenticate, async (req, res) => {
  const reviewId = req.params.id;
  if (supabase) {
    const { data, error } = await supabase.from('reviews').update(req.body).eq('id', reviewId).select();
    if (!error && data && data.length > 0) {
      return res.json(data[0]);
    }
    console.error('Supabase error updating review:', error ? error.message : 'No data returned');
  }
  const reviews = readData(reviewsFile);
  const index = reviews.findIndex(r => r.id === reviewId);
  if (index !== -1) {
    reviews[index] = { ...reviews[index], ...req.body };
    writeData(reviewsFile, reviews);
    res.json(reviews[index]);
  } else {
    res.status(404).json({ error: 'Review not found' });
  }
});

// Delete review
app.delete('/api/reviews/:id', authenticate, async (req, res) => {
  const reviewId = req.params.id;
  let reviewToDelete = null;

  if (supabase) {
    // Fetch review details to delete image
    const { data } = await supabase.from('reviews').select('mediaUrl').eq('id', reviewId).maybeSingle();
    reviewToDelete = data;

    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (!error) {
      if (reviewToDelete && reviewToDelete.mediaUrl && reviewToDelete.mediaUrl.includes('/uploads/')) {
        const filename = reviewToDelete.mediaUrl.split('/uploads/')[1];
        const filePath = path.join(uploadsFolder, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.json({ message: 'Review deleted' });
    }
    console.error('Supabase error deleting review:', error.message);
  }

  let reviews = readData(reviewsFile);
  const index = reviews.findIndex(r => r.id === reviewId);
  if (index !== -1) {
    const reviewImage = reviews[index].mediaUrl;
    if (reviewImage && reviewImage.includes('/uploads/')) {
      const filename = reviewImage.split('/uploads/')[1];
      const filePath = path.join(uploadsFolder, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    reviews.splice(index, 1);
    writeData(reviewsFile, reviews);
    res.json({ message: 'Review deleted' });
  } else {
    res.status(404).json({ error: 'Review not found' });
  }
});

// --- MANAGERS API ---

// Get all managers
app.get('/api/managers', async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from('managers').select('*').order('created_at', { ascending: true });
    if (!error) {
      return res.json(data);
    }
    console.error('Supabase error fetching managers:', error.message);
  }
  const managers = readData(managersFile);
  res.json(managers);
});

// Add new manager
app.post('/api/managers', authenticate, async (req, res) => {
  const newManager = {
    id: Date.now().toString(),
    ...req.body
  };
  if (supabase) {
    const { error } = await supabase.from('managers').insert(newManager);
    if (!error) {
      return res.status(201).json(newManager);
    }
    console.error('Supabase error inserting manager:', error.message);
  }
  const managers = readData(managersFile);
  managers.push(newManager);
  writeData(managersFile, managers);
  res.status(201).json(newManager);
});

// Edit manager
app.put('/api/managers/:id', authenticate, async (req, res) => {
  const managerId = req.params.id;
  if (supabase) {
    const { data, error } = await supabase.from('managers').update(req.body).eq('id', managerId).select();
    if (!error && data && data.length > 0) {
      return res.json(data[0]);
    }
    console.error('Supabase error updating manager:', error ? error.message : 'No data returned');
  }
  const managers = readData(managersFile);
  const index = managers.findIndex(m => m.id === managerId);
  if (index !== -1) {
    managers[index] = { ...managers[index], ...req.body };
    writeData(managersFile, managers);
    res.json(managers[index]);
  } else {
    res.status(404).json({ error: 'Manager not found' });
  }
});

// Delete manager
app.delete('/api/managers/:id', authenticate, async (req, res) => {
  const managerId = req.params.id;
  let managerToDelete = null;

  if (supabase) {
    // Fetch manager details to delete image
    const { data } = await supabase.from('managers').select('image').eq('id', managerId).maybeSingle();
    managerToDelete = data;

    const { error } = await supabase.from('managers').delete().eq('id', managerId);
    if (!error) {
      if (managerToDelete && managerToDelete.image && managerToDelete.image.includes('/uploads/')) {
        const filename = managerToDelete.image.split('/uploads/')[1];
        const filePath = path.join(uploadsFolder, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.json({ message: 'Manager deleted' });
    }
    console.error('Supabase error deleting manager:', error.message);
  }

  let managers = readData(managersFile);
  const index = managers.findIndex(m => m.id === managerId);
  if (index !== -1) {
    const managerImage = managers[index].image;
    if (managerImage && managerImage.includes('/uploads/')) {
      const filename = managerImage.split('/uploads/')[1];
      const filePath = path.join(uploadsFolder, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    managers.splice(index, 1);
    writeData(managersFile, managers);
    res.json({ message: 'Manager deleted' });
  } else {
    res.status(404).json({ error: 'Manager not found' });
  }
});

// --- FILE UPLOAD API ---
app.post('/api/upload', authenticate, upload.single('file'), async (req, res) => {
  if (req.file) {
    if (supabase) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(req.file.filename, fileBuffer, {
            contentType: req.file.mimetype,
            upsert: true
          });

        if (error) {
          console.error('Supabase storage upload error:', error.message);
          const fileUrl = `/uploads/${req.file.filename}`;
          return res.json({ fileUrl });
        }

        const { data: publicUrlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(req.file.filename);

        return res.json({ fileUrl: publicUrlData.publicUrl });
      } catch (err) {
        console.error('File upload logic error:', err.message);
      }
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ fileUrl });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

// --- CALLBACK REQUESTS API ---
const callbacksFile = path.join(__dirname, 'database', 'callbacks.json');

app.post('/api/callback', async (req, res) => {
  const { name, phone, car } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const newCallback = {
    id: Date.now().toString(),
    name,
    phone,
    car: car || '',
    date: new Date().toLocaleString('ru-RU')
  };

  if (supabase) {
    try {
      const { error } = await supabase.from('callbacks').insert(newCallback);
      if (!error) {
        return res.status(201).json(newCallback);
      }
      console.error('Supabase error inserting callback:', error.message);
    } catch (err) {
      console.error('Supabase callback error:', err.message);
    }
  }

  const callbacks = readData(callbacksFile);
  callbacks.push(newCallback);
  writeData(callbacksFile, callbacks);
  res.status(201).json(newCallback);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}/index.html to view site`);
  console.log(`Open http://localhost:${PORT}/admin.html to open admin dashboard`);
});
