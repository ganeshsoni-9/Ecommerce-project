module.exports = () => `CS-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random()*9000)}`;
