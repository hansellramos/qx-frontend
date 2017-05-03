<?php 
$certificate = $_GET['certificate'];
$validation = $_GET['validation'];
header("Location: http://localhost:8081/app/#/validate/{$validation}/certificate/{$certificate}");