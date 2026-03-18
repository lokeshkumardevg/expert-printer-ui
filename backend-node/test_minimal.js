const mongoose = require('mongoose');

const seed = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017', { dbName: 'techforcall' });
        console.log('Connected!');
        const User = mongoose.model('User', new mongoose.Schema({ email: String, name: String }));
        const existing = await User.findOne({ email: 'admin@techforcall.ai' });
        console.log('Existing:', existing);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
seed();
