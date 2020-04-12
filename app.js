'use strict';

var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var pino = require('express-pino-logger')();
var indexRouter = require('./routes/index');
const webpush = require('web-push');
const AdminBro = require('admin-bro');
const AdminBroSequelize = require('admin-bro-sequelizejs');
const AdminBroExpress = require('admin-bro-expressjs');
const argon2 = require('argon2');
const models = require('./models');
AdminBro.registerAdapter(AdminBroSequelize);

const generateSecret = function () {
  return '' + Math.random() + Math.random() + Math.random();
}

let adminBro = new AdminBro({
  databases: [models],
  rootPath: '/admin',
  branding: {
    companyName: 'COVID-19 PPE Tracker'
  },
  resources: [{
    resource: models.User,
    options: {
      properties: {
        password: {
          type: 'string',
          isVisible: {
            list: false, edit: true, filter: false, show: false,
          },
        },
      },
      actions: {
        new: {
          before: async (request) => {
            if (request.payload.password) {
              request.payload.password = await argon2.hash(request.payload.password);
            }
            return request;
          },
        }
      }
    }
  },
  {
    resource: models.Proof,
    options: {
      actions: {
        documents: {
          actionType: 'record',
          icon: 'View',
          isVisible: true,
          isAccessible: true,
          handler: async (req, res, context) => {
            let proof = context.record;
            const DocumentResource = context._admin.findResource('Documents')
            const docs = await models.Document.findAll({ where: { ProofId: proof.params.id } });
            const documentRecords = await DocumentResource.findMany(docs.map(it => it.id));
            proof.populate('documents', {
              records: documentRecords,
              toJSON: function() {
                return this.records.map(it => it.toJSON());
              }
            });
            return {
              record: proof.toJSON()
            }
          },
          component: AdminBro.bundle('./admin/view-proof-documents.component.jsx'),
        },
      },
    },
  }
  ],
});

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    const user = await models.User.findOne({
      where: {
        email,
        role: 'admin'
      }
    });
    if (user) {
      const matched = await argon2.verify(user.dataValues.password, password);
      if (matched) {
        return user;
      }
    }
    return false;
  },
  cookiePassword: generateSecret(),
})

// const router = AdminBroExpress.buildRouter(adminBro)

const vapidKeys = {
  publicKey: fs.readFileSync("./server.pub").toString(),
  privateKey: fs.readFileSync('./server.priv').toString()
};

webpush.setVapidDetails(
  'mailto:web-push-book@gauntface.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
var app = express();
let sess = {
  secret: generateSecret(),
  resave: false,
  saveUninitialized: true,
  cookie: {}
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

app.use(session(sess));
app.use(adminBro.options.rootPath, router);
app.set('view engine', 'ejs');
app.use(pino);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);

module.exports = app;
