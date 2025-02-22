
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Search endpoint
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q?.toLowerCase() || '';
        const response = await axios.get(`https://api.mangadex.org/manga`, {
            params: {
                title: query,
                limit: 5,
                includes: ['cover_art'],
                order: {
                    relevance: 'desc'
                }
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search manga' });
    }
});

// Popular manga route
router.get('/popular', async (req, res) => {
    try {
        const response = await axios.get('https://api.mangadex.org/manga', {
            params: {
                'order[followedCount]': 'desc',
                'limit': 12,
                'includes[]': ['cover_art', 'author'],
                'contentRating[]': ['safe', 'suggestive', 'erotica'],
                'availableTranslatedLanguage[]': ['en', 'ja']
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching popular manga:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch popular manga' });
    }
});

// Latest manga route
router.get('/latest', async (req, res) => {
    try {
        const response = await axios.get('https://api.mangadex.org/manga', {
            params: {
                'order[createdAt]': 'desc',
                'limit': 12,
                'includes[]': ['cover_art', 'author'],
                'contentRating[]': ['safe', 'suggestive', 'erotica']
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching latest manga:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch latest manga' });
    }
});

// Cover proxy route
router.get('/cover/:mangaId/:fileName', async (req, res) => {
    try {
        const { mangaId, fileName } = req.params;
        const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
        
        const response = await axios.get(coverUrl, {
            responseType: 'stream',
            timeout: 5000 // Tambahkan timeout
        });
        
        // Set cache headers
        res.set('Cache-Control', 'public, max-age=86400'); // Cache selama 24 jam
        res.set('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (error) {
        console.error('Error fetching cover:', error.message);
        // Redirect ke no-image jika gagal
        res.redirect('/images/no-image.png');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const mangaId = req.params.id;
        const response = await axios.get(`https://api.mangadex.org/manga/${mangaId}`, {
            params: {
                'includes[]': ['cover_art', 'author', 'artist', 'tag']
            }
        });

        // Get chapters for this manga
        const chaptersResponse = await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed`, {
            params: {
                'translatedLanguage[]': ['en'],
                'order[chapter]': 'desc',
                'limit': 100,
                'offset': 0
            }
        });

        // Get manga statistics
        const statsResponse = await axios.get(`https://api.mangadex.org/statistics/manga/${mangaId}`);
        const stats = statsResponse.data;
        
        // Add rating to manga data
        if (stats.statistics && stats.statistics[mangaId]) {
            response.data.data.attributes.rating = {
                average: stats.statistics[mangaId].rating.average || 0
            };
        }
        
        const responseData = {
            manga: response.data,
            chapters: chaptersResponse.data
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching manga details:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch manga details' });
    }
});

module.exports = router;
