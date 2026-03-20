/// <reference types="cypress" />

/**
 * KIỂM THỬ HỘP ĐEN - Điều hướng (Navigation & Routing)
 * 
 * Kiểm tra các route chính của ứng dụng hoạt động đúng.
 * Không cần biết logic bên trong, chỉ kiểm tra URL → Page hiển thị.
 */
describe('Điều hướng (Navigation) - Black-box Testing', () => {

  beforeEach(() => {
    // Stub các API chung để tránh lỗi network
    cy.intercept('GET', '**/movie/all*', {
      statusCode: 200,
      body: [
        {
          id: 1,
          movieName: 'Test Movie',
          duration: 120,
          rating: 4.0,
          releaseDate: '2024-01-01',
          genre: 'Action',
          language: 'VIETNAMESE',
          description: 'Test',
          movieImage: 'https://via.placeholder.com/300x450',
          isBanner: true,
          isDeleted: false
        }
      ]
    }).as('getMovies');
  });

  // TC10: Route /category load thành công
  it('TC10 - Trang Category load thành công', () => {
    cy.visit('/category');
    cy.pause(); // Nhấn "Next" để kiểm tra Category
    // Không bị redirect, vẫn ở /category
    cy.url().should('include', '/category');

    // Trang hiển thị (không phải 404 hay blank)
    cy.get('body').should('not.be.empty');
    cy.get('app-category').should('exist');
  });

  // TC11: Route /auth hiển thị form đăng nhập
  it('TC11 - Trang Auth hiển thị form đăng nhập', () => {
    cy.visit('/auth');
    cy.pause(); // Nhấn "Next" để kiểm tra Auth
    cy.url().should('include', '/auth');

    // Component auth hiện
    cy.get('app-auth').should('exist');

    // Form đăng nhập hiện
    cy.get('form').should('exist');
    cy.contains('Đăng nhập').should('be.visible');
  });

  // TC12: Route / hiển thị trang chủ với banner và movie list
  it('TC12 - Trang chủ hiển thị banner và danh sách phim', () => {
    cy.visit('/');
    cy.pause(); // Nhấn "Next" để kiểm tra Trang chủ
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    cy.wait('@getMovies');

    // Hero banner component hiện
    cy.get('app-hero-banner').should('exist');

    // Movie list component hiện
    cy.get('app-movie-list').should('exist');
  });
});
