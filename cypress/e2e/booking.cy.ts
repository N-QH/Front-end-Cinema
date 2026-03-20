/// <reference types="cypress" />

/**
 * KIỂM THỬ HỘP ĐEN - Đặt vé (Booking Flow)
 * 
 * Kiểm tra quy trình từ lúc chọn phim đến khi thanh toán thành công.
 */
describe('Đặt vé (Booking) - Black-box Testing', () => {

  beforeEach(() => {
    // 1. Giả lập trạng thái đã đăng nhập bằng cách set token vào localStorage
    window.localStorage.setItem('token', 'mock-jwt-token');

    // Mock API lấy thông tin user theo email (được gọi trong component Booking/Profile)
    cy.intercept('GET', '**/user/email/*', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'test@gmail.com',
        name: 'Test User',
        isOneTapEnabled: false
      }
    }).as('getUser');

    // Mock API login (nếu app có gọi lại)
    cy.intercept('POST', '**/user/login', {
      statusCode: 200,
      body: 'mock-jwt-token'
    }).as('loginAPI');
    
    // 2. Mock danh sách phim cho trang chủ
    cy.intercept('GET', '**/movie/all*', {
      statusCode: 200,
      body: [
        {
          id: 1,
          movieName: 'Avengers: Endgame',
          movieImage: 'https://via.placeholder.com/300x450',
          genre: 'Action',
          language: 'ENGLISH',
          duration: 181,
          rating: 4.8,
          isBanner: true
        }
      ]
    }).as('getMovies');

    // 3. Mock chi tiết phim cho trang MovieDetails
    cy.intercept('GET', '**/movie/1', {
      statusCode: 200,
      body: {
        id: 1,
        movieName: 'Avengers: Endgame',
        movieImage: 'https://via.placeholder.com/300x450',
        genre: 'Action',
        language: 'ENGLISH',
        duration: 181,
        rating: 4.8,
        releaseDate: '2024-04-26',
        description: 'The Avengers assemble once more.'
      }
    }).as('getMovieDetail');

    // 4. Mock danh sách rạp
    cy.intercept('GET', '**/theater/all', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Cinema Hùng Vương', address: 'Quận 5, TP.HCM' }
      ]
    }).as('getTheaters');

    // 4. Mock danh sách suất chiếu cho phim ID 1
    cy.intercept('GET', '**/show/movie/1', {
      statusCode: 200,
      body: [
        {
          id: 101,
          showTime: '18:30',
          showDate: '2024-12-30',
          screenNumber: '05',
          showSeatList: [
            { id: 1001, theaterSeat: { seatNo: '5A', seatType: 'STANDARD' }, price: 85000, isAvailable: true },
            { id: 1002, theaterSeat: { seatNo: '5B', seatType: 'STANDARD' }, price: 85000, isAvailable: true },
            { id: 1003, theaterSeat: { seatNo: '5C', seatType: 'PREMIUM' }, price: 110000, isAvailable: true }
          ]
        }
      ]
    }).as('getShows');

    // 5. Mock API đặt vé thành công
    cy.intercept('POST', '**/ticket/addNew', {
      statusCode: 200,
      body: 'Booking Successful'
    }).as('bookTicket');
  });

  it('TC13 - Quy trình đặt vé và thanh toán thành công', () => {
    // Truy cập trang chủ
    cy.visit('/');
    cy.wait('@getMovies');

    cy.pause(); // Nhấn "Next" để bắt đầu quy trình đặt vé

    // 1. Chọn phim
    cy.contains('Avengers').click();
    cy.url().should('include', '/movie/1');

    cy.pause(); // Nhấn "Next" để vào trang chọn ghế

    // 2. Click nút "Mua vé ngay"
    cy.get('.book-now-btn').click();
    cy.url().should('include', '/booking/1');
    cy.wait(['@getTheaters', '@getShows']);

    // 3. Chọn suất chiếu
    cy.contains('18:30').click();

    cy.pause(); // Nhấn "Next" để chọn ghế

    // 4. Chọn ghế (chọn ghế 5A)
    cy.get('.seat').not('.occupied').first().click();
    
    // Kiểm tra tổng tiền đã cập nhật (85.000đ)
    cy.get('.total-price').should('contain.text', '85.000');

    // 5. Nhấn "Tiếp tục thanh toán"
    cy.get('.continue-btn').should('not.be.disabled').click();
    cy.url().should('include', '/payment');

    cy.pause(); // Nhấn "Next" để thực hiện thanh toán cuối cùng

    // 6. Tại trang thanh toán, nhấn "Thanh Toán"
    cy.get('.checkout-btn').click();

    // 7. Chờ API book vé và kiểm tra redirect về trang danh sách vé
    cy.wait('@bookTicket');
    cy.url().should('include', '/tickets');
    
    // Kiểm tra thông báo thành công (Toast)
    cy.contains('Thanh toán thành công').should('be.visible');
  });

});
