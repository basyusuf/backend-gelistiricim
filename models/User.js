const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName:{
        type:String,
        required:true,
        unique:[true,'`{PATH}` alanı boş bırakılamaz.'],
        minLength:[3,'`{PATH}` alanı en kısa `{VALUE}` karakter olmalıdır.'],
        maxLength:[40,'`{PATH}` alanı en uzun `{VALUE}` karakter olmalıdır.']
    },
    role:{
        type:String,
        default:"user",
        enum:["user","admin"]
    },
    password:{
        type:String,
        required:true,
        mingLength:[6,"En az uzunluk `{VALUE}` olmalıdır"],
        select:false
    },
    email:{
        type:String,
        required:true,
        unique: [true,"Bu e-mail daha önce alınmış."],
        match:[/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Lütfen geçerli e-posta giriniz."]
    },
    firstName:{
        type:String,
        required:false
    },
    lastName:{
        type: String,
        required: false
    },
    images:{
        type:String,
        required:false,
        default:"none"
    },
    about:{
        type:String,
        required:false
    },
    links:{
        type:Array,
        required:false
    },
    emailConfirmStatus:{
        type:Boolean,
        required:true,
        default: false
    },
    createdAt: {
        type:Date,
        default:Date.now
    },
    status:{ //User ban olup olmama durumu
        type:Boolean,
        required:true,
        default:true
    }
});

module.exports = mongoose.model('user',UserSchema);