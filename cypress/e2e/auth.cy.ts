/// <reference types="cypress" />

/**
 * KIỂM THỬ HỘP ĐEN - Xác thực (Auth: Login & Register)
 * 
 * Kiểm tra từ góc nhìn người dùng cuối:
 * - Form hiển thị đúng
 * - Validation hoạt động
 * - Đăng nhập sai → thông báo lỗi
 * - Chuyển đổi giữa login/register
 */
describe('Xác thực (Auth) - Black-box Testing', () => {

  beforeEach(() => {
    cy.visit('/auth');
  });

  // TC04: Form đăng nhập hiển thị đúng
  it('TC04 - Form đăng nhập hiển thị đầy đủ các trường', () => {
    cy.pause(); // Nhấn "Next" để bắt đầu kiểm tra form
    // Kiểm tra tiêu đề
    cy.contains('Đăng nhập').should('be.visible');

    // Kiểm tra có input email
    cy.get('input#email').should('be.visible');
    cy.get('input#email').should('have.attr', 'type', 'email');

    // Kiểm tra có input password
    cy.get('input#password').should('be.visible');
    cy.get('input#password').should('have.attr', 'type', 'password');

    // Kiểm tra có nút submit
    cy.get('button[type="submit"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain.text', 'Đăng nhập');
  });

  // TC05: Đăng nhập thất bại → người dùng ở lại trang auth (không redirect)
  it('TC05 - Đăng nhập thất bại thì người dùng ở lại trang auth', () => {
    // Stub API login → trả lỗi mạng (trigger error callback ở Angular)
    cy.intercept('POST', '**/user/login', { forceNetworkError: true }).as('loginFail');

    cy.pause(); // Nhấn "Next" để bắt đầu điền thông tin

    // Nhập thông tin
    cy.get('input#email').type('wrong@email.com');
    cy.get('input#password').type('wrongpassword');

    // Submit form
    cy.get('button[type="submit"]').click();

    // Chờ request thất bại
    cy.wait('@loginFail');

    // Đợi 1 giây cho Angular xử lý response
    cy.wait(1000);

    // Kiểm tra: ở lại trang /auth (login thất bại → KHÔNG redirect đến /)
    cy.url().should('include', '/auth');

    // Kiểm tra: form login vẫn còn hiện (chưa bị xóa)
    cy.get('form').should('exist');
    cy.get('input#email').should('exist');
  });

  // TC06: Chuyển sang form đăng ký
  it('TC06 - Click "Đăng ký ngay" chuyển sang form đăng ký', () => {
    cy.pause(); // Nhấn "Next" để bắt đầu chuyển mode
    // Click link đăng ký
    cy.contains('Đăng ký ngay').click();

    // Kiểm tra tiêu đề đổi thành đăng ký
    cy.contains('Đăng ký tài khoản').should('be.visible');

    // Kiểm tra hiện thêm các trường đăng ký
    cy.get('input#name').should('be.visible');
    cy.get('input#phone').should('be.visible');
    cy.get('input#age').should('be.visible');
    cy.get('select#gender').should('be.visible');

    // Kiểm tra nút submit đổi text
    cy.get('button[type="submit"]').should('contain.text', 'Đăng ký');
  });

  // TC07: Validate form đăng ký - submit form trống
  it('TC07 - Submit form đăng ký trống không gửi request', () => {
    // Chuyển sang mode đăng ký
    cy.contains('Đăng ký ngay').click();

    cy.pause(); // Nhấn "Next" để test submit trống
    // Spy trên request - không nên gửi
    cy.intercept('POST', '**/user/register').as('registerRequest');

    // Click submit mà không điền gì
    cy.get('button[type="submit"]').click();

    // Kiểm tra form không submit (vẫn ở trang auth)
    cy.url().should('include', '/auth');

    // Kiểm tra các input required có validation
    cy.get('input#name:invalid').should('exist');
  });

  // TC08: Nút quên mật khẩu điều hướng đúng
  it('TC08 - Click "Quên mật khẩu?" điều hướng đến trang forgot-password', () => {
    // Kiểm tra link quên mật khẩu tồn tại
    cy.contains('Quên mật khẩu?').should('be.visible');

    // Click link
    cy.contains('Quên mật khẩu?').click();

    // Kiểm tra URL
    cy.url().should('include', '/forgot-password');
  });

  // TC09: Nút đăng nhập Google OAuth có link đúng
  it('TC09 - Nút Google OAuth có href đúng', () => {
    // Kiểm tra nút Google hiện
    cy.contains('Tiếp tục với Google').should('be.visible');

    // Kiểm tra href chứa đúng endpoint OAuth2
    cy.contains('Tiếp tục với Google')
      .should('have.attr', 'href')
      .and('include', '/oauth2/authorization/google');
  });
});
