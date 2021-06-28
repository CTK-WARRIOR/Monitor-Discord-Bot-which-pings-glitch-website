const mongoose = require('mongoose');
require ('./config.json').config();

module.exports = {
  
      useNewParser: true,
      useUnifiedTopology: true,
      autoIndex: false,
      poolSize: 5,
      connectTimeoutMS: 10000,
      family: 4
      
    };
    
    mongoose.connect(config.mongo_url);
    mongoose.set('useFindAndModify', false);
    mongoose.Promise = global.Promise;
    
    mongoose.connection('connected', () => {

    })
      
    }
}

}
