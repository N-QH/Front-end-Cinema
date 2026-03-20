/// <reference types="cypress" />

/**
 * KIỂM THỬ HỘP ĐEN - Trang chủ (Home)
 * 
 * Kiểm tra từ góc nhìn người dùng: hiển thị, tương tác, điều hướng.
 * Không cần biết code bên trong, chỉ kiểm tra Input → Output.
 */
describe('Trang chủ (Home Page) - Black-box Testing', () => {

  beforeEach(() => {
    // Stub API để test không phụ thuộc backend
    cy.intercept('GET', '**/movie/all*', {
      statusCode: 200,
      body: [
        {
          id: 1,
          movieName: 'Avengers: Endgame',
          duration: 181,
          rating: 4.8,
          releaseDate: '2024-04-26',
          genre: 'Action',
          language: 'ENGLISH',
          description: 'The Avengers assemble once more to reverse Thanos actions.',
          movieImage: 'https://via.placeholder.com/300x450?text=Avengers',
          isBanner: true,
          isDeleted: false
        },
        {
          id: 2,
          movieName: 'Hai Phượng',
          duration: 98,
          rating: 4.5,
          releaseDate: '2024-02-22',
          genre: 'Action',
          language: 'VIETNAMESE',
          description: 'Một người mẹ tìm con gái bị bắt cóc.',
          movieImage: 'https://via.placeholder.com/300x450?text=HaiPhuong',
          isBanner: false,
          isDeleted: false
        },
        {
          id: 3,
          movieName: 'Parasite',
          duration: 132,
          rating: 4.9,
          releaseDate: '2024-05-30',
          genre: 'Drama',
          language: 'KOREAN',
          description: 'A poor family schemes to become employed by a wealthy family.',
          movieImage: 'https://via.placeholder.com/300x450?text=Parasite',
          isBanner: false,
          isDeleted: false
        }
      ]
    }).as('getMovies');

    cy.visit('/');
  });

  // TC01: Trang chủ load thành công - hiển thị nội dung
  it('TC01 - Trang chủ load thành công và hiển thị nội dung', () => {
    cy.pause(); // Nhấn "Next" để bắt đầu kiểm tra nội dung
    // Kiểm tra trang load không lỗi
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // Chờ API movies trả về
    cy.wait('@getMovies');

    // Kiểm tra có nội dung phim hiển thị
    cy.get('body').should('be.visible');
    cy.contains('Avengers').should('exist');
  });

  // TC02: Điều hướng đến chi tiết phim khi click
  it('TC02 - Click vào phim thì điều hướng đến trang chi tiết', () => {
    cy.pause(); // Nhấn "Next" để bắt đầu test điều hướng
    cy.wait('@getMovies');

    // Tìm phần tử phim đầu tiên và click
    cy.contains('Avengers').click();

    // Kiểm tra URL chuyển đến trang chi tiết phim
    cy.url().should('include', '/movie/');
  });

  // TC03: Header hiển thị đúng với logo và navigation
  it('TC03 - Header hiển thị logo và thanh điều hướng', () => {
    cy.pause(); // Nhấn "Next" để bắt đầu kiểm tra Header
    // Kiểm tra header tồn tại
    cy.get('app-header').should('exist');

    // Kiểm tra có các link navigation chính
    cy.get('app-header').within(() => {
      cy.get('a, button, nav').should('exist');
    });
  });
});
