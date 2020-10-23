import chai from 'chai';
import chailHttp from 'chai-http';
import {User} from '../models';

const url = 'localhost:3000';
const expect = chai.expect;
chai.use(chailHttp);

describe('# [ AUTH ] 회원가입', () =>{
    before(async () => {
        await User.destroy({
            truncate: true
        });
    })   

    describe('POST /auth/join', () => {
        /**
         * /auth/join로 POST 요청이 오는 경우
         */                                                                                                                 
        it('비밀번호 값 필요', done => {
            chai.request(url)
                .post('/auth/join')
                .set('content-type', 'application/json')
                .send({email:'jihyekim019@gmail.com'})
                .end((err, res) => {
                    if(err) 
                        done(err);
                    expect(JSON.parse(res.text).code).to.equal('PASSWORD_IS_MISSING')
                    expect(res.status).to.equal(401)
                    done();
                });
        });
        it('이메일 값 필요', done => {
            chai.request(url)
                .post('/auth/join')
                .set('content-type', 'application/json')
                .send({password: 'shTmfah1!'})
                .end((err, res) => {
                    if(err) 
                        done(err);
                    expect(JSON.parse(res.text).code).to.equal('EMAIL_IS_MISSING')
                    expect(res.status).to.equal(401)
                    done();
                });
        });
        it('비밀번호 벨리데이션 에러 발생 - 특수문자 사용', done => {
            chai.request(url)
                .post('/auth/join')
                .set('content-type', 'application/json')
                .send({email:'jihyekim019@gmail.com',
                    password: 'shTmfah1!'})
                .end((err, res) => {
                    if(err) 
                        done(err);
                    expect(JSON.parse(res.text).code).to.equal('AUTH_REGEXP_FAIL_PASSWORD')
                    expect(res.status).to.equal(409)
                    done();
                });
        });
        it('비밀번호 벨리데이션 에러 발생 - 8자리 미만', done => {
            chai.request(url)
                .post('/auth/join')
                .set('content-type', 'application/json')
                .send({email:'jihyekim019@gmail.com',
                    password: 'shTm'})
                .end((err, res) => {
                    if(err) 
                        done(err);
                    expect(JSON.parse(res.text).code).to.equal('AUTH_REGEXP_FAIL_PASSWORD')
                    expect(res.status).to.equal(409)
                    done();
                });
        });
        it('비밀번호 벨리데이션 에러 발생 - 20자리 초과', done => {
            chai.request(url)
                .post('/auth/join')
                .set('content-type', 'application/json')
                .send({email:'jihyekim019@gmail.com',
                    password: '123456789012345678901'})
                .end((err, res) => {
                    if(err) 
                        done(err);
                    expect(JSON.parse(res.text).code).to.equal('AUTH_REGEXP_FAIL_PASSWORD')
                    expect(res.status).to.equal(409)
                    done();
                });
        });
        it('이메일 벨리데이션 에러 발생', done => {
            chai.request(url)
                .post('/auth/join')
                .set('content-type', 'application/json')
                .send({email:'jihyekim019@',
                    password: 'shTmfah1'})
                .end((err, res) => {
                    if(err) 
                        done(err);
                    expect(JSON.parse(res.text).code).to.equal('AUTH_REGEXP_FAIL_EMAIL')
                    expect(res.status).to.equal(409)
                    done();
                });
        });
        it('회원가입 성공 및 인증 이메일 전송', done => {
            chai.request(url)
                .post('/auth/join')
                .set('content-type', 'application/json')
                .send({email:'jihyekim019@gmail.com',
                       password: 'shTmfah1'})
                .end((err, res) => {
                    if(err) 
                        done(err);
                    expect(JSON.parse(res.text).code).to.equal('AUTH_SUCCESS')
                    expect(res.status).to.equal(200)
                    done();
                 });
        });
        it('중복 계정 생성 불가', done => {
            chai.request(url)
                .post('/auth/join')
                .set('content-type', 'application/json')
                .send({email:'jihyekim019@gmail.com',
                       password: 'shTmfah1'})
                .end((err, res) => {
                    if(err) 
                        done(err);
                    expect(JSON.parse(res.text).code).to.equal('AUTH_DUPLICATED_EMAIL')
                    expect(res.status).to.equal(409)
                    done();
                 });
        });
    });
});    


describe('# [ AUTH ] 인증 이메일 재전송', () =>{
    describe('POST /auth/send/address', () => {
        it('이메일 값 필요', done => {
            chai.request(url)
                .post('/auth/send/address')
                .set('content-type', 'application/json')
                .end((err, res) => {
                    if(err) 
                        done(err);
                    expect(JSON.parse(res.text).code).to.equal('EMAIL_IS_MISSING')
                    expect(res.status).to.equal(401)
                    done();
                 });
        });
        it('인증 이메일 전송 성공', done => {
            chai.request(url)
                .post('/auth/send/address')
                .set('content-type', 'application/json')
                .send({email:'jihyekim019@gmail.com'})
                .end((err, res, req) => {
                    if(err) 
                        done(err);
                    expect(JSON.parse(res.text).code).to.equal('AUTH_SUCCESS')
                    expect(res.status).to.equal(200)
                    done();
                 });
        });
    })
});  

const key = User.findOne({
    attribute: ['verify_key'],
    where: {email: 'jihyekim019@gmail.com'}
}).then(console.log(key));

describe('# [ AUTH ] 이메일 인증 확인', () =>{
    describe('POST /auth/confirmEmail', async () => {
        it('이메일 인증 실패', done => {
            chai.request(url)
                .get('/auth/confirmEmail')
                .query({key: key})
                .end((err, req, res) => {
                    if(err) 
                        done(err);
                    expect(res).to.redirect
                    expect(req).to.have.param('result')
                    done();
                 });
        });
    })
});  

describe('# [ AUTH ] 유저 리스트 조회', () =>{
    describe('get /auth/list', () => {
        it('관리자 확인', done => {
            chai.request(url)
                .post('/auth/login')
                .set('content-type', 'application/json')
                .send({email: "nsm200704@gmail.com", password: "shTmfah1"})
                .end((err, res) => {
                    if(err) 
                        done(err);
                    expect(JSON.parse(res.text).code).to.equal('AUTH_SUCCESS')
                    expect(req.atoken).to.have.deep.property('atok en',{user_level: 10000})
                 });
        })
    })
})