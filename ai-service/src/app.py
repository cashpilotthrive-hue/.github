from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import logging
from typing import Dict, Any
import time

# Import verification modules
from verifiers.identity_verifier import IdentityVerifier
from verifiers.fraud_detector import FraudDetector
from verifiers.document_verifier import DocumentVerifier
from verifiers.compliance_checker import ComplianceChecker
from utils.audit_logger import AuditLogger

load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize verifiers
identity_verifier = IdentityVerifier()
fraud_detector = FraudDetector()
document_verifier = DocumentVerifier()
compliance_checker = ComplianceChecker()
audit_logger = AuditLogger()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'ai-kyc-verifier'}), 200

@app.route('/api/verify/identity', methods=['POST'])
def verify_identity():
    """Verify identity using face recognition and document matching"""
    try:
        start_time = time.time()
        data = request.json
        
        document_front_url = data.get('documentFrontUrl')
        selfie_url = data.get('selfieUrl')
        kyc_id = data.get('kycId')
        
        if not all([document_front_url, selfie_url, kyc_id]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = identity_verifier.verify(document_front_url, selfie_url)
        processing_time = int((time.time() - start_time) * 1000)
        
        # Log the verification
        audit_logger.log_verification(
            kyc_id=kyc_id,
            verification_type='identity',
            result=result,
            processing_time=processing_time
        )
        
        response = {
            'kycId': kyc_id,
            'verificationType': 'identity',
            'result': result['result'],
            'confidence': result['confidence'],
            'details': result.get('details', {}),
            'processingTimeMs': processing_time,
            'aiModel': 'facenet-v1.0'
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Identity verification error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/verify/fraud', methods=['POST'])
def detect_fraud():
    """Detect potential fraud in documents"""
    try:
        start_time = time.time()
        data = request.json
        
        document_urls = data.get('documentUrls', [])
        user_data = data.get('userData', {})
        kyc_id = data.get('kycId')
        
        if not kyc_id or not document_urls:
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = fraud_detector.detect(document_urls, user_data)
        processing_time = int((time.time() - start_time) * 1000)
        
        # Log the verification
        audit_logger.log_verification(
            kyc_id=kyc_id,
            verification_type='fraud',
            result=result,
            processing_time=processing_time
        )
        
        response = {
            'kycId': kyc_id,
            'verificationType': 'fraud',
            'result': result['result'],
            'confidence': result['confidence'],
            'details': result.get('details', {}),
            'processingTimeMs': processing_time,
            'aiModel': 'fraud-detector-v2.1'
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Fraud detection error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/verify/document', methods=['POST'])
def verify_document():
    """Verify document quality and authenticity"""
    try:
        start_time = time.time()
        data = request.json
        
        document_url = data.get('documentUrl')
        document_type = data.get('documentType')
        kyc_id = data.get('kycId')
        
        if not all([document_url, document_type, kyc_id]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = document_verifier.verify(document_url, document_type)
        processing_time = int((time.time() - start_time) * 1000)
        
        # Log the verification
        audit_logger.log_verification(
            kyc_id=kyc_id,
            verification_type='document_quality',
            result=result,
            processing_time=processing_time
        )
        
        response = {
            'kycId': kyc_id,
            'verificationType': 'document_quality',
            'result': result['result'],
            'confidence': result['confidence'],
            'details': result.get('details', {}),
            'processingTimeMs': processing_time,
            'aiModel': 'docnet-v1.5'
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Document verification error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/verify/compliance', methods=['POST'])
def check_compliance():
    """Check compliance with regulations"""
    try:
        start_time = time.time()
        data = request.json
        
        user_data = data.get('userData', {})
        kyc_id = data.get('kycId')
        
        if not all([user_data, kyc_id]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = compliance_checker.check(user_data)
        processing_time = int((time.time() - start_time) * 1000)
        
        # Log the verification
        audit_logger.log_verification(
            kyc_id=kyc_id,
            verification_type='compliance',
            result=result,
            processing_time=processing_time
        )
        
        response = {
            'kycId': kyc_id,
            'verificationType': 'compliance',
            'result': result['result'],
            'confidence': result['confidence'],
            'details': result.get('details', {}),
            'processingTimeMs': processing_time,
            'aiModel': 'compliance-checker-v1.0'
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Compliance check error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/verify/complete', methods=['POST'])
def complete_verification():
    """Run all verification checks in sequence"""
    try:
        start_time = time.time()
        data = request.json
        
        kyc_id = data.get('kycId')
        if not kyc_id:
            return jsonify({'error': 'Missing kycId'}), 400
        
        results = []
        overall_result = 'pass'
        overall_confidence = 0.0
        
        # Run all verifications
        if data.get('documentFrontUrl') and data.get('selfieUrl'):
            identity_result = identity_verifier.verify(
                data['documentFrontUrl'], 
                data['selfieUrl']
            )
            results.append({
                'type': 'identity',
                'result': identity_result['result'],
                'confidence': identity_result['confidence']
            })
            if identity_result['result'] != 'pass':
                overall_result = 'manual_review'
        
        if data.get('documentUrls'):
            fraud_result = fraud_detector.detect(
                data['documentUrls'],
                data.get('userData', {})
            )
            results.append({
                'type': 'fraud',
                'result': fraud_result['result'],
                'confidence': fraud_result['confidence']
            })
            if fraud_result['result'] == 'fail':
                overall_result = 'fail'
        
        if data.get('documentFrontUrl'):
            doc_result = document_verifier.verify(
                data['documentFrontUrl'],
                data.get('documentType', 'passport')
            )
            results.append({
                'type': 'document_quality',
                'result': doc_result['result'],
                'confidence': doc_result['confidence']
            })
            if doc_result['result'] != 'pass':
                overall_result = 'manual_review'
        
        if data.get('userData'):
            comp_result = compliance_checker.check(data['userData'])
            results.append({
                'type': 'compliance',
                'result': comp_result['result'],
                'confidence': comp_result['confidence']
            })
            if comp_result['result'] == 'fail':
                overall_result = 'fail'
        
        # Calculate overall confidence
        if results:
            overall_confidence = sum(r['confidence'] for r in results) / len(results)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        response = {
            'kycId': kyc_id,
            'overallResult': overall_result,
            'overallConfidence': round(overall_confidence, 4),
            'verifications': results,
            'processingTimeMs': processing_time,
            'requiresManualReview': overall_result == 'manual_review'
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Complete verification error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'File too large. Maximum size is 16MB'}), 413

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_ENV') == 'development')
