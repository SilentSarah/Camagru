<?php

require_once __DIR__ . '/Models/User.php';
require_once __DIR__ . '/Models/Photo.php';
require_once __DIR__ . '/Models/Like.php';
require_once __DIR__ . '/Models/Comment.php';
require_once __DIR__ . '/Models/Filter.php';
require_once __DIR__ . '/Models/PhotoFilter.php';
require_once __DIR__ . '/Models/Notification.php';

echo "Testing Models...\n\n";

try {
    // Test User Model
    echo "1. Testing User Model...\n";
    $userModel = new User();
    $user = $userModel->create([
        'username' => 'testuser_' . time(),
        'email' => 'test_' . time() . '@example.com',
        'password' => password_hash('testpass', PASSWORD_DEFAULT),
        'is_verified' => 1
    ]);
    echo "✓ User created with ID: " . $user['id'] . "\n\n";

    // Test Photo Model
    echo "2. Testing Photo Model...\n";
    $photoModel = new Photo();
    $photo = $photoModel->create([
        'user_id' => $user['id'],
        'image_path' => '/uploads/test_photo.jpg'
    ]);
    echo "✓ Photo created with ID: " . $photo['id'] . "\n\n";

    // Test Filter Model
    echo "3. Testing Filter Model...\n";
    $filterModel = new Filter();
    $filter = $filterModel->create([
        'name' => 'Vintage Filter',
        'image_path' => '/filters/vintage.png'
    ]);
    echo "✓ Filter created with ID: " . $filter['id'] . "\n\n";

    // Test PhotoFilter Model
    echo "4. Testing PhotoFilter Model...\n";
    $photoFilterModel = new PhotoFilter();
    $photoFilter = $photoFilterModel->create([
        'photo_id' => $photo['id'],
        'filter_id' => $filter['id'],
        'position_x' => 100,
        'position_y' => 200,
        'width' => 300,
        'height' => 400
    ]);
    echo "✓ PhotoFilter created with ID: " . $photoFilter['id'] . "\n\n";

    // Test Like Model
    echo "5. Testing Like Model...\n";
    $likeModel = new Like();
    $like = $likeModel->create([
        'photo_id' => $photo['id'],
        'user_id' => $user['id']
    ]);
    echo "✓ Like created with ID: " . $like['id'] . "\n\n";

    // Test Comment Model
    echo "6. Testing Comment Model...\n";
    $commentModel = new Comment();
    $comment = $commentModel->create([
        'photo_id' => $photo['id'],
        'user_id' => $user['id'],
        'content' => 'This is a test comment!'
    ]);
    echo "✓ Comment created with ID: " . $comment['id'] . "\n\n";

    // Test Notification Model
    echo "7. Testing Notification Model...\n";
    $notificationModel = new Notification();
    $notification = $notificationModel->create([
        'user_id' => $user['id'],
        'message' => 'Someone liked your photo!',
        'is_read' => 0
    ]);
    echo "✓ Notification created with ID: " . $notification['id'] . "\n\n";

    // Test findAll
    echo "8. Testing findAll methods...\n";
    $allPhotos = $photoModel->findAll();
    echo "✓ Found " . count($allPhotos) . " photo(s)\n";
    $allLikes = $likeModel->findAll();
    echo "✓ Found " . count($allLikes) . " like(s)\n";
    $allComments = $commentModel->findAll();
    echo "✓ Found " . count($allComments) . " comment(s)\n\n";

    // Test find by ID
    echo "9. Testing find by ID...\n";
    $foundPhoto = $photoModel->find($photo['id']);
    echo "✓ Found photo: " . $foundPhoto['image_path'] . "\n";
    $foundUser = $userModel->find($user['id']);
    echo "✓ Found user: " . $foundUser['username'] . "\n\n";

    // Test findBy
    echo "10. Testing findBy...\n";
    $userPhotos = $photoModel->findBy(['user_id' => $user['id']], []);
    echo "✓ Found " . count($userPhotos) . " photo(s) for user\n";
    $photoComments = $commentModel->findBy(['photo_id' => $photo['id']], []);
    echo "✓ Found " . count($photoComments) . " comment(s) for photo\n\n";

    // Test update
    echo "11. Testing update...\n";
    $notificationModel->update($notification['id'], ['is_read' => 1]);
    $updatedNotification = $notificationModel->find($notification['id']);
    echo "✓ Notification is_read updated to: " . ($updatedNotification['is_read'] ? 'true' : 'false') . "\n\n";

    // Test delete
    echo "12. Testing delete...\n";
    $likeModel->delete($like['id']);
    $deletedLike = $likeModel->find($like['id']);
    echo "✓ Like deleted: " . ($deletedLike === false ? 'true' : 'false') . "\n\n";

    echo "✅ All tests passed successfully!\n";

} catch (Exception $e) {
    echo "❌ Test failed: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
